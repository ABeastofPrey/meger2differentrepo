import { TPVariable } from '../tp/tp-variable.model';

export class MCProject {
  name: string;
  dependencies: string[] = [];
  macros: Macro[] = [];
  settings: ProjectSettings;
  errors: Array<{
    id: number;
    name: string;
  }> = [];
  apps: App[] = [];
  backgroundTaskList: string[] = [];
  dependenciesLoaded: boolean;
  projectPaused: boolean;

  constructor(name: string) {
    this.name = name;
    this.settings = new ProjectSettings();
  }

  /*
   * STRING IS IN FORMAT: APP1,0;APP2,1;...
   */
  initAppsFromString(str: string) {
    this.apps = [];
    if (str.length === 0) return;
    const apps = str.split(';');
    for (const app of apps) {
      const parts = app.split(',');
      this.apps.push({
        name: parts[0],
        libs: [],
        active: parts[1] === '1',
        data: [],
        status: -1,
        id: -1,
        cyclic: parts[2] === '1',
        desc: '',
      });
    }
  }
}

export class App {
  name: string;
  libs: string[];
  active: boolean;
  data: TPVariable[];
  status: number;
  id: number;
  cyclic: boolean;
  desc: string; // Description of the app
}

export class ProjectSettings {
  ascale: number;
  vscale: number;
  vtran: number;
  vrate: number;
  blendingMethod: number;
  tool: string;
  base: string;
  mtable: string;
  wpiece: string;
  overlap: boolean;
  limits: LimitsObject = new LimitsObject();
  autoStart: boolean;
}

class LimitsObject {
  position: Limit[];
  world: Limit[] = [
    new Limit('X', 'mm'),
    new Limit('Y', 'mm'),
    new Limit('Z', 'mm'),
  ];
  tool: Limit[] = [
    new Limit('X', 'mm'),
    new Limit('Y', 'mm'),
    new Limit('Z', 'mm'),
  ];
  base: Limit[] = [
    new Limit('X', 'mm'),
    new Limit('Y', 'mm'),
    new Limit('Z', 'mm'),
  ];
  mt: Limit[] = [
    new Limit('X', 'mm'),
    new Limit('Y', 'mm'),
    new Limit('Z', 'mm'),
  ];
  wp: Limit[] = [
    new Limit('X', 'mm'),
    new Limit('Y', 'mm'),
    new Limit('Z', 'mm'),
  ];
}

export class Macro {
  key: string;
  app: string;
}

export class Limit {
  name: string;
  min: number | string;
  max: number | string;
  units: string;

  constructor(name, units) {
    this.name = name;
    this.units = units;
  }
}
