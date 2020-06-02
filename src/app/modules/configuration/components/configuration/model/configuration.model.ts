export class SafetyConfiguration {

  private _ini: string; // the original ini json
  private _asJson: {};

  // read-only
  private _ex_estop1_in: boolean;
  get ex_estop1_in(): boolean { return this._ex_estop1_in; }
  private _safe_ack_butt_in: boolean;
  get safe_ack_butt_in(): boolean { return this._safe_ack_butt_in; }
  private _safety_sense1_in: boolean;
  get safety_sense1_in(): boolean { return this._safety_sense1_in; }
  private _teachp_enable_in: boolean;
  get teachp_enable_in(): boolean { return this._teachp_enable_in; }
  private _teachp_estop1_in: boolean;
  get teachp_estop1_in(): boolean { return this._teachp_estop1_in; }
  
  // editable
  safety_sense2: boolean;

  constructor(ini: string, asJson: {}) {

    this._ini = ini;
    this._asJson = asJson;
    
    // INIT
    try {
      this._ex_estop1_in = this.getBit(Number(this._asJson['SS1']['Input_Select']),4);
      this._safe_ack_butt_in = this.getBit(Number(this._asJson['Global']['Acknowledge_Input_Select']),5);
      this._safety_sense1_in = this.getBit(Number(this._asJson['SS1']['Input_Select']),6);
      this.safety_sense2 = this.getBit(Number(this._asJson['SS1']['Input_Select']),7);
      this._teachp_enable_in = this.getBit(Number(this._asJson['Global']['Input_Use_Enable']),3);
      this._teachp_estop1_in = this.getBit(Number(this._asJson['SS1']['Input_Select']), 2);
    } catch (err) {
      console.warn(err);
    }
  }

  /* Returns TRUE if bit at @param idx (starting from 1) is set */
  private getBit(num: number, idx: number) : boolean {
    return ((num >> idx) & 1) === 1;
  }

  private setBit(num: number, idx:number, value: boolean): number {
    if (value) {
      return num | 1 << idx;
    }
    return num & ~(1 << idx);
  }

  get ini () {

    // modify safety_sense2
    const SS1_INPUT_SELECT = Number(this._asJson['SS1']['Input_Select']);
    const SS1_INPUT_SELECT_NEW = this.setBit(SS1_INPUT_SELECT, 7, this.safety_sense2);
    this._asJson['SS1']['Input_Select'] = SS1_INPUT_SELECT_NEW.toString();
    
    // create ini
    let ini = '';
    for (let key in this._asJson) {
      ini += `\n[${key}]\n`;
      for (let child in this._asJson[key]) {
        ini += `${child} = ${this._asJson[key][child]}\n`
      }
    }
    
    return ini;

  }

}