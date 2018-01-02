import {Component, OnInit} from '@angular/core';
import {StatsService} from './services/stats.service';
import {LocalStats} from './model/local-stats';
import {WorkerInfo} from './model/worker-info';
import {GlobalStats} from './model/global-stats';
import {RecentBlock} from './model/block';
import {ClipboardHelper} from './clipboard-helper';
import {MatSnackBar} from '@angular/material';
import {MINER_URL} from './config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  localStats: LocalStats;
  globalStats: GlobalStats;
  errorMessage: any;
  workersInfo: WorkerInfo[];
  expectedTimeToBlock: number;
  recentBlocks: RecentBlock[];
  showRecentBlocks: boolean;
  minerUrl: string;

  constructor(private statsService: StatsService,
              public snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.minerUrl = MINER_URL;
    setInterval(() => this.RequestInfo(), 10000);
    // this.RequestInfo();
  }

  private RequestInfo() {
    this.statsService.GetLocalStats()
      .then(localStats => {
        this.localStats = localStats;
        this.localStats.block_value = +this.localStats.block_value.toFixed(8);
        this.localStats.efficiency = +(this.localStats.efficiency * 100).toFixed(2);
        this.workersInfo = localStats.miner_hash_rates.map(hash_rate => {
          const workerInfo = new WorkerInfo();
          workerInfo.Address = hash_rate.Address;
          workerInfo.HashRate = Math.round(hash_rate.Value / 1000000);
          for (const difficult of localStats.miner_last_difficulties) {
            if (difficult.Address === workerInfo.Address) {
              workerInfo.LastDifficult = Math.round(difficult.Value);
            }
          }
          return workerInfo;
        });

        this.statsService.GetCurrentPayouts()
          .then(payouts => {
            for (const workerInfo of this.workersInfo) {
              for (const payout of payouts) {
                if (payout.Address === workerInfo.Address) {
                  workerInfo.CurrentPayout = payout.Value;
                }
              }
            }

            this.statsService.GetGlobalStats()
              .then(globalStats => {
                this.globalStats = globalStats;
                for (const workerInfo of this.workersInfo) {
                  this.expectedTimeToBlock = localStats.attempts_to_block / globalStats.pool_hash_rate / 60 / 60;
                  workerInfo.ProfitOnDay = +(workerInfo.CurrentPayout / this.expectedTimeToBlock * 24).toFixed(4);
                  this.expectedTimeToBlock = +this.expectedTimeToBlock.toFixed();
                }
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
          const a = new Date(recentBlock.ts * 1000);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          const year = a.getFullYear();
          const month = months[a.getMonth()];
          const date = a.getDate();
          const hour = a.getHours();
          const min = a.getMinutes();
          const sec = a.getSeconds();
          recentBlock.time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
        }
      })
      .catch(reason => {
        this.errorMessage = reason;
      });
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
