import { Io } from './io.model';

export class IoModule {
  name: string;
  inputs: Io[] = [];
  outputs: Io[] = [];
  firstInput: number;
  lastInput: number;
  firstOutput: number;
  lastOutput: number;
  constructor(initString: string) {
    const parts = initString.split(',');
    this.name = parts[0];
    this.firstInput = Number(parts[1]);
    this.lastInput = Number(parts[2]);
    this.firstOutput = Number(parts[3]);
    this.lastOutput = Number(parts[4]);
  }

  setInputs(inputString: string) {
    const parts = inputString.split(';');
    const inputs: Io[] = [];
    for (const p of parts) {
      if (p.length === 0) continue;
      inputs.push(new Io(p));
    }
    this.inputs = inputs;
  }

  setOutputs(outputString: string) {
    const parts = outputString.split(';');
    const outputs: Io[] = [];
    for (const p of parts) {
      if (p.length === 0) continue;
      outputs.push(new Io(p));
    }
    this.outputs = outputs;
  }
}
