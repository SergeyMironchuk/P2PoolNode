import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {LocalStats} from '../model/local-stats';
import {AppErrorHandler} from './error-handler';
import {CURRENT_PAYOUTS_URL, GLOBAL_STATS_URL, LOCAL_STATS_URL, RECENT_BLOCKS_URL} from '../config';
import {WorkerValuesHelper} from './worker-values-helper';
import {WorkerValue} from '../model/worker-value';
import {GlobalStats} from '../model/global-stats';
import {RecentBlock} from '../model/block';
import {WorkerInfo} from '../model/worker-info';

@Injectable()
export class StatsService {

  constructor(private http: Http) { }

  GetLocalStats(): Promise<LocalStats> {
    return this.http.get(LOCAL_STATS_URL)
      .toPromise()
      .then(response => {
        const res = response.json();
        const localStats = res as LocalStats;
        const miner_hash_rates = WorkerValuesHelper.ExtractWorkerValues(res.miner_hash_rates);
        const miner_last_difficulties = WorkerValuesHelper.ExtractWorkerValues(res.miner_last_difficulties);
        const miner_dead_hash_rates = WorkerValuesHelper.ExtractWorkerValues(res.miner_dead_hash_rates);
        localStats.miner_hash_rates = miner_hash_rates;
        localStats.miner_last_difficulties = miner_last_difficulties;
        localStats.miner_dead_hash_rates = miner_dead_hash_rates;
        return localStats;
      })
      .catch(reason => AppErrorHandler.handleError(reason));
  }

  GetGlobalStats(): Promise<GlobalStats> {
    return this.http.get(GLOBAL_STATS_URL)
      .toPromise()
      .then(response => {
        const res = response.json();
        const globalStats = res as GlobalStats;
        return globalStats;
      })
      .catch(reason => AppErrorHandler.handleError(reason));
  }

  GetCurrentPayouts(): Promise<WorkerValue[]> {
    return this.http.get(CURRENT_PAYOUTS_URL)
      .toPromise()
      .then(response => {
        const res = response.json();
        const currentPayouts = WorkerValuesHelper.ExtractWorkerValues(res);
        return currentPayouts;
      })
      .catch(reason => AppErrorHandler.handleError(reason));
  }

  GetRecentBlocks(): Promise<RecentBlock[]> {
    return this.http.get(RECENT_BLOCKS_URL)
      .toPromise()
      .then(response => {
        const res = response.json();
        const blocks = res as RecentBlock[];
        return blocks;
      })
      .catch(reason => AppErrorHandler.handleError(reason));
  }

  GetWorkersInfo(localStats: LocalStats, payouts: WorkerValue[], expectedTimeForBlockAverage: number): WorkerInfo[] {
    const workersInfo = localStats.miner_hash_rates.map(hash_rate => {
      const workerInfo = new WorkerInfo();
      workerInfo.Address = hash_rate.Address;
      workerInfo.HashRate = Math.round(hash_rate.Value / 1000000);
      for (const difficult of localStats.miner_last_difficulties) {
        if (difficult.Address === workerInfo.Address) {
          workerInfo.LastDifficult = Math.round(difficult.Value);
        }
      }
      for (const dead of localStats.miner_dead_hash_rates) {
        if (dead.Address === workerInfo.Address) {
          workerInfo.Rejected = +((dead.Value / 1000000) / workerInfo.HashRate * 100).toFixed(2);
        }
      }
      return workerInfo;
    });

    for (const workerInfo of workersInfo) {
      for (const payout of payouts) {
        if (payout.Address === workerInfo.Address) {
          workerInfo.CurrentPayout = payout.Value;
        }
      }
      const profitPerDay = +(workerInfo.CurrentPayout / expectedTimeForBlockAverage * 24).toFixed(4);
      workerInfo.ProfitPerDay = profitPerDay;
    }

    const workersInfoSorted = workersInfo.sort((w1, w2) => {
      if (w1.HashRate < w2.HashRate) {
        return 1;
      }

      if (w1.HashRate > w2.HashRate) {
        return -1;
      }

      return 0;
    });
    return workersInfoSorted;
  }
}
