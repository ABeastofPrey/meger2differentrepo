export class Pallet {
  private _name: string;
  private _type: string;

  constructor(palletName: string, palletType: string) {
    this._name = palletName;
    this._type = palletType;
  }

  get name() {
    return this._name;
  }
  get type() {
    return this._type;
  }

  index: number;
  order: string;
  orderList: string[];
  items_x: number;
  items_y: number;
  items_z: number;
  item_size_x: number;
  item_size_y: number;
  item_size_z: number;
  pallet_size_x: number;
  pallet_size_y: number;
  pallet_size_z: number;
  levels: number;
  diffOddEven: boolean;
  origin: PalletLocation = new PalletLocation();
  posX: PalletLocation = new PalletLocation();
  posY: PalletLocation = new PalletLocation();
  entry: PalletLocation = new PalletLocation();
  approach_offset_vertical: number;
  approach_offset_horizontal: number;
  approach_direction: string;
  retract_offset_vertical: number;
  retract_offset_horizontal: number;
  retract_direction: string;
  isFrameCalibrated: boolean = false;
  appEnabled: boolean = false;
  retEnabled: boolean = false;
  entryEnabled: boolean = false;
  retExceed: boolean = false;
  appExceed: boolean = false;
  dataFile: string = null;
}

export class PalletLocation {
  x: number = null;
  y: number = null;
  z: number = null;
  yaw: number = null;
  pitch: number = null;
  roll: number = null;

  public toString = (): string => {
    return (
      '#{' +
      this.x +
      ',' +
      this.y +
      ',' +
      this.z +
      ',' +
      this.yaw +
      ',' +
      this.pitch +
      ',' +
      this.roll +
      '}'
    );
  };
}
