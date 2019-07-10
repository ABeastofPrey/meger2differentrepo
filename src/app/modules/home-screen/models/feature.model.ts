export class Feature {
  name: string = '';
  code: string = '';
  hash: string;

  constructor() {}

  toString() {
    return this.name + ';' + this.name + ';' + this.code + ';' + this.hash;
  }
}
