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
  itemsX: number;
  itemsY: number;
  itemsZ: number;
  itemSizeX: number;
  itemSizeY: number;
  itemSizeZ: number;
  palletSizeX: number;
  palletSizeY: number;
  palletSizeZ: number;
  levels: number;
  diffOddEven: boolean;
  origin: PalletLocation = new PalletLocation();
  posX: PalletLocation = new PalletLocation();
  posY: PalletLocation = new PalletLocation();
  entry: PalletLocation = new PalletLocation();
  approachOffsetVertical: number;
  approachOffsetHorizontal: number;
  approachDirection: string;
  retractOffsetVertical: number;
  retractOffsetHorizontal: number;
  retractDirection: string;
  isFrameCalibrated = false;
  appEnabled = false;
  retEnabled = false;
  entryEnabled = false;
  retExceed = false;
  appExceed = false;
  dataFile: string = null;
  flags: number[] = [0, 0, 0];
}

export class PalletLocation {
  x: number = null;
  y: number = null;
  z: number = null;
  yaw: number = null;
  pitch: number = null;
  roll: number = null;
  flags: number[] = null;

  toString = (): string => {
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
