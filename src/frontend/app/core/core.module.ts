import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';

import { AuthGuardService } from './auth-guard.service';
import { EventWatcherService } from './event-watcher/event-watcher.service';
import { MDAppModule } from './md.module';
import { PageHeaderService } from './page-header-service/page-header.service';
import { UtilsService } from './utils.service';
import { WindowRef } from './window-ref/window-ref.service';
import { LogOutDialogComponent } from './log-out-dialog/log-out-dialog.component';
import { LoggerService } from './logger.service';
import { EndpointsService } from './endpoints.service';
import { UserService } from './user.service';
import { EntityServiceFactory } from './entity-service-factory.service';
import { TruncatePipe } from './truncate.pipe';

@NgModule({
  imports: [
    MDAppModule
  ],
  exports: [
    MDAppModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    LogOutDialogComponent,
    TruncatePipe
  ],
  providers: [
    AuthGuardService,
    PageHeaderService,
    EventWatcherService,
    WindowRef,
    UtilsService,
    LoggerService,
    EndpointsService,
    UserService,
    EntityServiceFactory,
  ],
  declarations: [
    LogOutDialogComponent,
    TruncatePipe
  ],
  entryComponents: [
    LogOutDialogComponent
  ],
})
export class CoreModule { }
