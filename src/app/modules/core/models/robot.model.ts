export interface RobotModel {
  type: string;
  name: string;
  bus: string;
  payload: number;
  'part number': string;
}

export interface RobotSeries {
  name: string;
  models: RobotModel[];
}

export interface RobotAxesType {
  axes: number;
  series: RobotSeries[];
}

export interface RobotTypes {
  SCARA: RobotAxesType[];
  PUMA: RobotAxesType[];
  DELTA: RobotAxesType[];
  OTHER: RobotAxesType[];
}
