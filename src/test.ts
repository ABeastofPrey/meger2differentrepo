// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import 'hammerjs';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Then we find all the tests.
const programSettingsContext = require.context('./app/modules/program-editor/components/program-settings/arch-setting/', true, /\.spec\.ts$/);
// And load the modules.
programSettingsContext.keys().map(programSettingsContext);

const resultDialogContext = require.context('./app/modules/program-editor/components/tool-calibration-result-dialog/', true, /\.spec\.ts$/);
resultDialogContext.keys().map(resultDialogContext);

const osUpgradeSuccessDialogContext = require.context('./app/components/osupgrade-success-dialog/', true, /\.spec\.ts$/);
osUpgradeSuccessDialogContext.keys().map(osUpgradeSuccessDialogContext);

const osUpgradeErrorDialogContext = require.context('./app/components/osupgrade-error-dialog/', true, /\.spec\.ts$/);
osUpgradeErrorDialogContext.keys().map(osUpgradeErrorDialogContext);

const activationContext = require.context('./app/modules/help/components/activation/', true, /\.spec\.ts$/);
activationContext.keys().map(activationContext);

// const ioContext = require.context('./app/modules/configuration/components/io/', true, /\.spec\.ts$/);
// ioContext.keys().map(ioContext);

// const configurationServiceContext = require.context('./app/modules/configuration/services/', true,/\.spec\.ts$/);
// configurationServiceContext.keys().map(configurationServiceContext);

const rmContext = require.context('./app/modules/configuration/components/reference-mastering/', true, /\.spec\.ts$/);
rmContext.keys().map(rmContext);

const versionContext = require.context('./app/modules/configuration/components/version/', true, /\.spec\.ts$/);
versionContext.keys().map(versionContext);

const topologyContext = require.context('./app/modules/configuration/components/topology/', true, /\.spec\.ts$/);
topologyContext.keys().map(topologyContext);

const vCommandContext = require.context('./app/modules/program-editor/components/combined-dialogs/components/vision-command/', true, /\.spec\.ts$/);
vCommandContext.keys().map(vCommandContext);

// const jumpxCommandContext = require.context('./app/modules/program-editor/components/combined-dialogs/components/jumpx-command/', true, /\.spec\.ts$/);
// jumpxCommandContext.keys().map(jumpxCommandContext); // Unstable with unknow undefined.

const traceContext = require.context('./app/modules/dashboard/components/trace/', true, /\.spec\.ts$/);
traceContext.keys().map(traceContext);

const diagnosisContext = require.context('./app/modules/tools/components/diagnosis/', true, /\.spec\.ts$/);
diagnosisContext.keys().map(diagnosisContext);

const syslogCauseContext = require.context('./app/modules/sys-log/components/log-cause/', true, /\.spec\.ts$/);
syslogCauseContext.keys().map(syslogCauseContext);

const syslogSnackContext = require.context('./app/modules/sys-log/components/log-snack-bar/', true, /\.spec\.ts$/);
syslogSnackContext.keys().map(syslogSnackContext);

const pluginInstallContext = require.context('./app/modules/plugins/install-plugin/', true, /\.spec\.ts$/);
pluginInstallContext.keys().map(pluginInstallContext);

const pluginManageContext = require.context('./app/modules/configuration/components/plugin-manage', true, /\.spec\.ts$/);
pluginManageContext.keys().map(pluginManageContext);

const pluginManagePopContext = require.context('./app/modules/configuration/components/plugin-manage-pop', true, /\.spec\.ts$/);
pluginManagePopContext.keys().map(pluginManagePopContext);

const programFunctionContext = require.context('./app/modules/program-editor/components/dialogs/function-program', true, /\.spec\.ts$/);
programFunctionContext.keys().map(programFunctionContext);
const maintenanceArmContext = require.context('./app/modules/maintenance-arm/maintenance-dialog/', true, /\.spec\.ts$/);
maintenanceArmContext.keys().map(maintenanceArmContext);

const subFunctionContext = require.context('./app/modules/program-editor/components/dialogs/sub-program', true, /\.spec\.ts$/);
subFunctionContext.keys().map(subFunctionContext);

const selectFrameContext = require.context('./app/modules/program-editor/components/dialogs/select-frame-dialog', true, /\.spec\.ts$/);
selectFrameContext.keys().map(selectFrameContext);

const customKeyBoardContext = require.context('./app/components/custom-key-board', true, /\.spec\.ts$/);
customKeyBoardContext.keys().map(customKeyBoardContext);


