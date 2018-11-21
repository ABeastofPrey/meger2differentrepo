export class Io {
  id: number;
  simulated: boolean;
  name: string;
  description: string;
  valid: boolean;
  value: boolean;
  
  constructor(ioString: string) {
    const innerParts = ioString.split(',');
    this.id = Number(innerParts[0]);
    this.simulated = innerParts[1] === '1';
    this.name = innerParts[2];
    this.description = innerParts[3];
    this.valid = innerParts[4] === '1';
  }
}