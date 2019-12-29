export class RobotCoordinateType {
  readonly legends: string[] = [];
  readonly flags: string[] = [];

  get all() {
    return this.legends.concat(this.flags);
  }

  constructor(str: string) {
    const parts = str.split(';');
    if (parts.length !== 2) {
      console.error('invalid legend string:' + str);
      return;
    }
    this.legends = parts[0].split(',').filter(p=>{
      return p.length > 0;
    });
    this.flags = parts[1].split(',').filter(p=>{
      return p.length > 0;
    });
  }
}
