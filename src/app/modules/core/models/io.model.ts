export class IO {
  id : number;
  name : string;
  description : string;
  state : boolean;
  device : string;
  
  constructor(ioString : string) { // (100,Output1,No Name,0,A1)
    ioString = ioString.slice(1,-1); // REMOVE BRACKETS
    let parts = ioString.split(',');
    if (parts.length < 5)
      return;
    this.id = Number(parts[0]);
    this.name = parts[1];
    this.description = parts[2];
    this.state = (parts[3] === '1');
    this.device = parts[4];
  }
}
