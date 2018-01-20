import {Component, OnInit} from '@angular/core';
import {StatsService} from './services/stats.service';
import {LocalStats} from './model/local-stats';
import {WorkerInfo} from './model/worker-info';
import {GlobalStats} from './model/global-stats';
import {RecentBlock} from './model/block';
import {ClipboardHelper} from './clipboard-helper';
import {MatSnackBar} from '@angular/material';
import {MINER_URL} from './config';
import {ProfitPerDayStats} from './model/profit-per-day-stats';
import {TimeHelper} from './time-helper';
import {WorkerValue} from './model/worker-value';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // title = 'app';
  localStats: LocalStats;
  globalStats: GlobalStats;
  errorMessage: any;
  workersInfo: WorkerInfo[];
  recentBlocks: RecentBlock[];
  showRecentBlocks: boolean;
  minerUrl: string;
  expectedTimeToBlock: number;
  expectedTimesToBlock: number[];
  expectedTimeToBlockAverage: number;

  constructor(private statsService: StatsService,
              public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.expectedTimesToBlock = new Array<number>();
    this.minerUrl = MINER_URL;
    this.RequestInfo();
    setInterval(() => this.RequestInfo(), 10000);
    // this.RequestInfo();
  }

  private RequestInfo() {
    this.statsService.GetLocalStats()
      .then(localStats => {

        this.statsService.GetCurrentPayouts()
          .then(payouts => {

            this.statsService.GetGlobalStats()
              .then(globalStats => {
                this.expectedTimeToBlock = localStats.attempts_to_block / globalStats.pool_hash_rate / 60 / 60;
                this.expectedTimesToBlock.push(this.expectedTimeToBlock);
                this.expectedTimeToBlock = +this.expectedTimeToBlock.toFixed();

                this.workersInfo = this.statsService.GetWorkersInfo(localStats, payouts, this.GetExpectedTimeForBlockAverage());

                this.localStats = localStats;
                this.localStats.block_value = +localStats.block_value.toFixed(8);
                this.localStats.efficiency = +(localStats.efficiency * 100).toFixed(2);
                this.globalStats = globalStats;
              })
              .catch(reason => {
                this.errorMessage = reason;
              });
          })
          .catch(reason => {
            this.errorMessage = reason;
          });

      })
      .catch(reason => {
        this.errorMessage = reason;
      });

    this.statsService.GetRecentBlocks()
      .then(blocks => {
        this.recentBlocks = blocks;
        this.showRecentBlocks = (this.recentBlocks.length > 0);
        for (const recentBlock of this.recentBlocks) {
          const time = TimeHelper.GetTimeFromTimestamp(recentBlock.ts);
          recentBlock.time = time;
        }
      })
      .catch(reason => {
        this.errorMessage = reason;
      });
  }

  private GetExpectedTimeForBlockAverage(): number {
    let result = 0;
    if (this.expectedTimesToBlock.length > 8640) {
      this.expectedTimesToBlock.shift();
    }
    if (this.expectedTimesToBlock.length > 0) {
      for (const value of this.expectedTimesToBlock) {
        result += value;
      }
      result = result / this.expectedTimesToBlock.length;
      this.expectedTimeToBlockAverage = +result.toFixed(2);
    }
    return result;
  }

  CopyDirectloadUrl() {
    ClipboardHelper.copyToClipboard(this.minerUrl);
    this.openSnackBar('Copied to Clipboard', '');
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
