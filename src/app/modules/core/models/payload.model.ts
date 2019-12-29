export class Payload {
  name: string;
  refPos: Position[];
  mass: number;
  inertia: number;
  lx: number;
  /*j5_max: number;
  j5_min: number;
  j5_ident_vel: number;
  j5_ident_time: number;
  j5_ident_done: boolean;
  j6_max: number;
  j6_min: number;
  j6_ident_vel: number;
  j6_ident_time: number;
  j6_ident_done: boolean;*/

  constructor(name: string, axes: number) {
    this.name = name;
    this.refPos = [];
    for (let i = 0; i < axes; i++) {
      this.refPos.push({ value: 0 });
    }
  }
}

export interface Position {
  value: number;
}
