import { TPVariableType } from './tp-variable-type.model';

export class TPVariable {
  
  name: string;
  value: any = null;
  isArr: boolean = false;
  isTwoDimension: boolean = false;
  varType: TPVariableType = null;
  isPosition: boolean = false;
  typeStr: string = null;
  selectedIndex: number = 1;
  selectedSecondIndex: number = 1;
  
  private _dataLoaded: boolean = false;
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
      let secondIndex = str.indexOf('][');
      if (secondIndex === -1)
      {
        str = str.substring(index + 1, str.length - 1);
        let arrSize = parseInt(str);
        this.value = new Array<TPVariable>(arrSize);
        for (var i = 0; i < arrSize; i++) {
          this.value[i] = new TPVariable(varType);
        }
      }
      else {
        this.isTwoDimension = true;
        let arrSize = parseInt(str.substring(index + 1, secondIndex));
        let arrSecondSize = parseInt(str.substring(secondIndex + 2, str.length - 1));
        this.value = [];
        for (var i = 0; i < arrSize; i++) {
          this.value[i] = [];
          for (var j = 0; j < arrSecondSize; j++) {
            this.value[i][j] = new TPVariable(varType);
          } 
        }
      }
    }
  }
}
