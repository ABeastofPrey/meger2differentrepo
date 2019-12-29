export class Feature {
  name = '';
  code = '';
  hash: string;

  constructor() {}

  toString() {
    return this.name + ';' + this.name + ';' + this.code + ';' + this.hash;
  }
}
