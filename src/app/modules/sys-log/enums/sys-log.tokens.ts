import { InjectionToken } from '@angular/core';
import { SystemLog } from './sys-log.model';

export const SYS_LOG_SNAKBAR_DATA = new InjectionToken<SystemLog>('SYS_LOG_SNAKBAR_DATA');

export const SYS_LOG_SNAKBAR_COUNT = new InjectionToken<SystemLog>('SYS_LOG_SNAKBAR_COUNT');
