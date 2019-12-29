import { TPVariableType } from './tp-variable-type.model';

interface VariableValue {
  value: string | number;
}

export class TPVariable {
  
  name: string;
  value: number | Array< TPVariable | VariableValue | Array< TPVariable | VariableValue>> = null;
  isArr = false;
  isTwoDimension = false;
  varType: TPVariableType | null = null;
  isPosition = false;
  typeStr: string | null = null;
  selectedIndex = 1;
  selectedSecondIndex = 1;

  private _dataLoaded = false;
  set dataLoaded(val: boolean) {
    this._dataLoaded = val;
  }

  /*
   * returns TRUE if the variable data was once loaded (tp_get_value_namespace
   * was called at least once)
   */
  get dataLoaded() {
    return this._dataLoaded;
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
      default:
        break;
    }
    if (typeof str === 'undefined') {
      this.value = 0;
      this.name = '';
      return;
    }
    const index = str.indexOf('[');
    if (index === -1) {
      this.name = str;
    } else {
      this.name = str.substring(0, index);
      this.isArr = true;
      const secondIndex = str.indexOf('][');
      if (secondIndex === -1) {
        str = str.substring(index + 1, str.length - 1);
        const arrSize = Number(str);
        this.value = new Array<TPVariable>(arrSize);
        for (let i = 0; i < arrSize; i++) {
          this.value[i] = new TPVariable(varType);
        }
      } else {
        this.isTwoDimension = true;
        const arrSize = Number(str.substring(index + 1, secondIndex));
        const arrSecondSize = Number(str.substring(secondIndex + 2, str.length - 1));
        this.value = [];
        for (let i = 0; i < arrSize; i++) {
          this.value[i] = [];
          for (let j = 0; j < arrSecondSize; j++) {
            this.value[i][j] = new TPVariable(varType);
          } 
  }
      }
    }
  }
}
