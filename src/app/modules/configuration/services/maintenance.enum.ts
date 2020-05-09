import { FormControl } from '@angular/forms';

export interface MainTable1Type {
  unit: string;
  max: number;
  control: FormControl;
  index: number;
  vaild: boolean;
}

export interface MainTable1List {
    moduleName: string;
    usedLife: MainTable1Type,
    apply: boolean;
}

export interface MainTable1SavePrev {
  moduleName: string;
  usedLife: number;
}

export interface MainTable2List {
    moduleName: string;
    date: string;
    person: string;
    orderNum: string;
    comment: string;
    row: number;
    surplusLife?: number;
}

export interface MainTable2Data {
  historyPage: MainTable2Module[];
}

export interface MainTable2Module {
  moduleName: string;
  history: MainTable2History[];
}

export interface MainTable2History {
  date: string;
  person: string;
  orderNum: string;
  comment: string;
  surplusLife: number;
  row: number;
  moduleName: string;
  life: {
    num: number;
    unitName: string;
  }
}

export interface MainTable3Data {
  infoPage: MainTable3Module[];
}

export interface MainTable3Module {
  moduleName: string;
  info: MainTable3Info[];
}

export interface MainTable3Info {
  performTime: string;
  surplusLife: number;
  moduleName: string;
  row: number;
  surplus: {
    num: number;
    unitName: string;
  }
}

export interface MainTable3List {
  moduleName: string,
  performTime: string,
  surplus: {
    num: number,
    unitName: string
  },
  row: number
}