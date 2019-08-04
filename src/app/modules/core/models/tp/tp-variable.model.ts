import { TPVariableType } from './tp-variable-type.model';

export class TPVariable {
  name: string;
  value: any = null;
  isArr: boolean = false;
  varType: TPVariableType = null;
  isPosition: boolean = false;
  typeStr: string = null;
  selectedIndex: number = 1;

  get dataLoaded() {
    const v = this.value;
    const i = this.selectedIndex;
    return this.isArr ? v && v[i].value : v;
  }

  constructor(varType: TPVariableType, str?: string) {
    this.varType = varType;
    switch (varType) {
      case TPVariableType.JOINT:
        this.typeStr = 'JOINT';
        this.isPosition = true;
        break;
      case TPVariableType.LOCATION:
        this.typeStr = 'LOCATION';
        this.isPosition = true;
        break;
      case TPVariableType.DOUBLE:
        this.typeStr = 'DOUBLE';
        break;
      case TPVariableType.LONG:
        this.typeStr = 'LONG';
        break;
      case TPVariableType.STRING:
        this.typeStr = 'STRING';
        break;
    }
    if (typeof str === 'undefined') {
      this.value = 0;
      this.name = '';
      return;
    }
    var index = str.indexOf('[');
    if (index === -1) this.name = str;
    else {
      this.name = str.substring(0, index);
      this.isArr = true;
      str = str.substring(index + 1, str.length - 1);
      var arrSize = parseInt(str);
      this.value = new Array<TPVariable>(arrSize);
      for (var i = 0; i < arrSize; i++) {
        this.value[i] = new TPVariable(varType);
      }
    }
  }
}
