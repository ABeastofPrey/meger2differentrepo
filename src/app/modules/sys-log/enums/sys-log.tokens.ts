import { InjectionToken } from '@angular/core';
import { SystemLog } from './sys-log.model';

export const SYS_LOG_SNAKBAR_LOG = new InjectionToken<SystemLog>('SYS_LOG_SNAKBAR_LOG');

export const SYS_LOG_SNAKBAR_COUNT = new InjectionToken<number>('SYS_LOG_SNAKBAR_COUNT');

export const SYS_LOG_SNAKBAR_TIP = new InjectionToken<string>('SYS_LOG_SNAKBAR_TIP');