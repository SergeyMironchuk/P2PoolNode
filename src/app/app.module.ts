import { BrowserModule } from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import { AppComponent } from './app.component';
import {StatsService} from './services/stats.service';
import {HttpModule} from '@angular/http';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {RouterModule} from '@angular/router';
import {MatToolbarModule, MatIconModule, MatButtonModule, MatSnackBarModule, MatTooltipModule} from '@angular/material';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    NoopAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule.forRoot([ ])
  ],
  providers: [StatsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
