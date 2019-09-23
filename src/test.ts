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
const programSettingsContext = require.context(
  './app/modules/program-editor/components/program-settings/',
  true,
  /\.spec\.ts$/
);
// And load the modules.
programSettingsContext.keys().map(programSettingsContext);

const resultDialogContext = require.context('./app/modules/program-editor/components/tool-calibration-result-dialog/', true, /\.spec\.ts$/);
resultDialogContext.keys().map(resultDialogContext);

const jumpDialogContext = require.context('./app/modules/program-editor/components/dialogs/jump-dialog/', true, /\.spec\.ts$/);
jumpDialogContext.keys().map(jumpDialogContext);

const jump3DialogContext = require.context('./app/modules/program-editor/components/dialogs/jump3-dialog/', true, /\.spec\.ts$/);
jump3DialogContext.keys().map(jump3DialogContext);

const osUpgradeSuccessDialogContext = require.context('./app/components/osupgrade-success-dialog/', true, /\.spec\.ts$/);
osUpgradeSuccessDialogContext.keys().map(osUpgradeSuccessDialogContext);

const osUpgradeErrorDialogContext = require.context('./app/components/osupgrade-error-dialog/', true, /\.spec\.ts$/);
osUpgradeErrorDialogContext.keys().map(osUpgradeErrorDialogContext);

const activationContext = require.context(
  './app/modules/help/components/activation/',
  true,
  /\.spec\.ts$/
);
activationContext.keys().map(activationContext);

const ioContext = require.context(
  './app/modules/configuration/components/io/',
  true,
  /\.spec\.ts$/
);
ioContext.keys().map(ioContext);

const configurationServiceContext = require.context(
  './app/modules/configuration/services/',
  true,
  /\.spec\.ts$/
);
configurationServiceContext.keys().map(configurationServiceContext);

const rmContext = require.context('./app/modules/configuration/components/reference-mastering/', true, /\.spec\.ts$/);
rmContext.keys().map(rmContext);

const versionContext = require.context('./app/modules/configuration/components/version/', true, /\.spec\.ts$/);
versionContext.keys().map(versionContext);

const topologyContext = require.context('./app/modules/configuration/components/topology/', true, /\.spec\.ts$/);
topologyContext.keys().map(topologyContext);
