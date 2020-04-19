const INPUT_SIZE = 8;
const OUTPUT_SIZE = 9;

export class SafetyConfiguration {

  private _ini: IniNode[]; // the original ini json

  private getValue(key: string, child: string): string {
    const n = this._ini.find(n=>{
      return n.name === key
    });
    if (!n) return null;
    const c = n.children.find(c=>{
      return c.name === child;
    });
    return c ? c.value : null;
  }

  private setValue(key: string, child: string, value: string) {
    const n = this._ini.find(n=>{
      return n.name === key;
    });
    if (!n) return false;
    const c = n.children.find(c=>{
      return c.name === child;
    });
    if (!c) return false;
    c.value = value;
    return true;
  }

  /* VALUES TO BE MODIFIED BY THE USER */
  sbc_t1: string;
  sbc_t2: string;
  ss1_t1: string;
  inputs = new Array<IO>(INPUT_SIZE);
  outputs = new Array<IO>(OUTPUT_SIZE);
  
  private _ss1_inp = new Array<number>(INPUT_SIZE);
  private _sto_inp = new Array<number>(INPUT_SIZE);
  private _sto_out = new Array<number>(OUTPUT_SIZE);
  private _sbc_out = new Array<number>(OUTPUT_SIZE);
  

  constructor(ini: IniNode[]) {
    this._ini = ini;
    const err = this.parseIni();
    if (err) {
      console.error(err);
    }
  }

  private getBitValue(key: string, child: string, i: number) {
    const sVal = this.getValue(key, child);
    const val = Number(sVal);
    if (isNaN(val)) return NaN;
    const mask = 1 << i;
    return (val & mask) >>> i;
  }

  onOutputChange(i: number) {
    switch (this.outputs[i].value) {
      case 'STO':
        this._sto_out[i] = 1;
        this._sbc_out[i] = 0;
        break;
      case 'SBC':
        this._sto_out[i] = 0;
        this._sbc_out[i] = 1;
        break;
      default:
        this._sto_out[i] = 0;
        this._sbc_out[i] = 0;
        break;
    }
  }

  onInputChange(i: number) {
    switch (this.inputs[i].value) {
      case 'STO':
        this._sto_inp[i] = 1;
        this._ss1_inp[i] = 0;
        break;
      case 'SS1':
        this._sto_inp[i] = 0;
        this._ss1_inp[i] = 1;
        break;
      default:
        this._sto_inp[i] = 0;
        this._ss1_inp[i] = 0;
        break;
    }
  }

  private parseIni(): string {
    this.sbc_t1 = this.getValue('SBC','Time_t1');
    this.sbc_t2 = this.getValue('SBC','Time_t2');
    this.ss1_t1 = this.getValue('SS1','Time_t1');
    for (let i=0; i<INPUT_SIZE; i++) {
      this.inputs[i] = {
        name: 'SDI ' + (i+1),
        value: null
      };
      this._sto_inp[i] = this.getBitValue('STO','Input_Select',i);
      this._ss1_inp[i] = this.getBitValue('SS1','Input_Select',i);
      if (this._sto_inp[i] && this._ss1_inp[i]) return 'Invalid inputs';
      if (this._sto_inp[i]) {
        this.inputs[i].value = 'STO';
      } else if (this._ss1_inp[i]) {
        this.inputs[i].value = 'SS1';
      } else {
        this.inputs[i].value = 'IDLE';
      }
    }
    for (let i=0; i<OUTPUT_SIZE; i++) {
      this.outputs[i] = {
        name: 'SDO ' + (i+1),
        value: null
      };
      this._sto_out[i] = this.getBitValue('STO','Output_Select',i);
      this._sbc_out[i] = this.getBitValue('SBC','Output_Select',i);
      if (this._sto_out[i] && this._sbc_out[i]) return 'Invalid outputs';
      if (this._sto_out[i]) {
        this.outputs[i].value = 'STO';
      } else if (this._sbc_out[i]) {
        this.outputs[i].value = 'SBC';
      } else {
        this.outputs[i].value = 'IDLE';
      }
    }
    return null;
  }

  toString() {
    return this._ini.map(node=>{
      return '<b>' + node.name + ':</b>\n' + node.children.map(c=>{
        let val = c.value;
        const i = c.value.indexOf(';');
        if (i>0) {
          val = val.substring(0,i).trim();
        }
        return c.name + ': ' + val;
      }).join('\n');
    }).join('\n\n');
  }

}

export interface IniNode {
  name: string;
  children: Array<{name: string, value: string}>
}

interface IO {
  name: string;
  value: string;
}