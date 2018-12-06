import { Injectable } from '@angular/core';
import { Store, Action } from '@ngrx/store';
import { AppState } from '../store/app-state';
import { LoggerInfoAction, LoggerDebugAction, LoggerWarnAction, LoggerErrorAction, LogLevel } from '../store/actions/log.actions';
import { environment } from '../../environments/environment';

export enum LogLevelStringToNumber {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

@Injectable()
export class LoggerService {

  constructor(private store: Store<AppState>) { }

  private log(level: LogLevel, message: string, arg: any) {
    if (LogLevelStringToNumber[level] < LogLevelStringToNumber[environment.logLevel] || !environment.logToConsole) {
      return;
    }
    const date = new Date();
    message = `${date.toUTCString()}- ${message}`;

    let func = console.log;
    switch (level) {
      case LogLevel.ERROR:
        func = console.error;
        this.store.dispatch(new LoggerErrorAction(message));
        break;
      case LogLevel.WARN:
        func = console.warn;
        this.store.dispatch(new LoggerWarnAction(message));
        break;
      case LogLevel.INFO:
        func = console.info;
        this.store.dispatch(new LoggerInfoAction(message));
        break;
      case LogLevel.DEBUG:
        func = console.log;
        this.store.dispatch(new LoggerDebugAction(message));
        break;
    }

    if (arg) {
      func(message, arg);
    } else {
      func(message);
    }
  }

  debug(message: string, arg?: any) {
    this.log(LogLevel.DEBUG, message, arg);
  }

  info(message: string, arg?: any) {
    this.log(LogLevel.INFO, message, arg);
  }

  warn(message: string, arg?: any) {
    this.log(LogLevel.WARN, message, arg);
  }

  error(message: string, arg?: any) {
    this.log(LogLevel.ERROR, message, arg);
  }

}
