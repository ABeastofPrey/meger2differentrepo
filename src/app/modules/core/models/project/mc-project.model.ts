import {TPVariable} from "../tp/tp-variable.model";

export class MCProject {
  name : string;
  dependencies: string[] = [];
  macros: Macro[] = [];
  settings: ProjectSettings;
  errors: {
    id: number,
    name: string
  }[] = [];
  apps: App[] = [];
  
  constructor(name: string) {
    this.name = name;
    this.settings = new ProjectSettings();
  }
  
  /*
   * STRING IS IN FORMAT: APP1,0;APP2,1;...
   */
  initAppsFromString(str:string) {
    if (str.length === 0)
      return;
    const apps = str.split(';');
    for (let app of apps) {
      const parts = app.split(',');
      this.apps.push({
        name: parts[0],
        libs: [],
        active: parts[1] === '1',
        data: [],
        status: -1
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
}

export class ProjectSettings {
  vcruise: number;
  vtran: number;
  blendingMethod : number;
  tool: string;
  base: string;
  mtable: string;
  wpiece: string;
  overlap: boolean;
}

export class Macro {
  key:string;
  app:string;
}