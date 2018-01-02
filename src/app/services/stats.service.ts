import { Injectable } from '@angular/core';
import {Http} from '@angular/http';
import {LocalStats} from '../model/local-stats';
import {AppErrorHandler} from './error-handler';
import {CURRENT_PAYOUTS_URL, GLOBAL_STATS_URL, LOCAL_STATS_URL, RECENT_BLOCKS_URL} from '../config';
import {WorkerValuesHelper} from './worker-values-helper';
import {WorkerValue} from '../model/worker-value';
import {GlobalStats} from '../model/global-stats';
import {RecentBlock} from '../model/block';

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
        localStats.miner_hash_rates = miner_hash_rates;
        localStats.miner_last_difficulties = miner_last_difficulties;
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
}
