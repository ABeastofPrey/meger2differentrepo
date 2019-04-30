// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);
// Then we find all the tests.
const programSettingsContext = require.context('./app/modules/program-editor/components/program-settings/', true, /\.spec\.ts$/);
// And load the modules.
programSettingsContext.keys().map(programSettingsContext);

const jump3DialogContext = require.context('./app/modules/program-editor/components/dialogs/jump3-dialog/', true, /\.spec\.ts$/);
// And load the modules.
jump3DialogContext.keys().map(jump3DialogContext);
