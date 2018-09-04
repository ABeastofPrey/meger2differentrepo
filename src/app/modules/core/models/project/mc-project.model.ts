export class MCProject {
  name : string;
  dependencies: string[] = [];
  macros: {
    key:string,
    app:string
  }[] = [];
  settings: {
    vcruise: number,
    vtran: number,
    blendingMethod: number,
    tool: string,
    base: string,
    mtable: string,
    wpiece: string,
    overlap: boolean
  };
  errors: {
    id: number,
    name: string
  }[] = [];
  apps: {
    name: string,
    libs: string[]
  }[] = [];
  
  constructor(name: string) {
    this.name = name;
  }
}