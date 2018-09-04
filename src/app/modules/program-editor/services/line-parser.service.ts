import { Injectable } from '@angular/core';
import {TPVariable} from '../../core/models/tp/tp-variable.model';
import {DataService} from '../../core';

enum LineType {MOVE,CIRCLE,PROGRAM,OTHER};

@Injectable()
export class LineParserService {
  
  constructor(
    private data : DataService
  ) {}
  
  getLineType(row: string): LineType {
    row = row.toUpperCase().trim();
    if (row.startsWith('MOVE'))
      return LineType.MOVE;
    if (row.startsWith('CIRCLE'))
      return LineType.CIRCLE;
    if (row.startsWith('PROGRAM'))
      return LineType.PROGRAM;
    return LineType.OTHER;
  }
  
  getVariablesFromLine(row: string): TPVariable[] {
    row = row.toUpperCase().replace(/CIRCLEPOINT|TARGETPOINT|=/gi,'').trim();
    let result : TPVariable[] = [];
    let tmp = row.split(' ');
    if (tmp.length <= 1)
      return result;
    let varList = this.data.joints.concat(this.data.locations);
    for (let i = 1; i < tmp.length; i++) {
      if (tmp[i].length === 0 || i === 1 && this.data.robots.includes(tmp[i]))
        continue;
      let varIndex = -1;
      let bracket = tmp[i].indexOf('[');
      if (bracket > -1 && bracket < tmp[i].length - 1) {
        let tmpIndex = tmp[i].substring(bracket + 1).slice(0,-1).trim();
        if (tmpIndex.length  > 0)
          varIndex = Number(tmpIndex);
        else
          continue;
        if (isNaN(varIndex)) {
          varIndex = -1;
          continue;
        }
        tmp[i] = tmp[i].substring(0,bracket);
      } else if (bracket > -1)
        continue;
      for (let v of varList) {
        if (tmp[i] === v.name) {
          if (v.isArr && v.value.length <= varIndex)
            continue;
          let varCopy = Object.assign({}, v);
          varCopy.selectedIndex = varIndex;
          result.push(varCopy);
        }
      }
    }
    return result;
  }
  
  getMotionElementFromLine(row : string) : string {
    row = row.toUpperCase().replace(/CIRCLEPOINT|TARGETPOINT|=/gi,'').trim();
    let tmp = row.split(' ');
    if (tmp.length < 2)
      return null;
    let i = 1;
    while (i < tmp.length && tmp[i].length === 0)
      i++;
    if (tmp[i].length === 0)
      return null;
    return this.data.robots.includes(tmp[i]) ? tmp[i] : null;
  }
  
  getLineParameters(line : string, lineType: LineType, rowIndex: number) {
    let searchWord : string;
    let index : number;
    let params = {
      lineType: lineType,
      line: rowIndex
    };
    line = line.toUpperCase().trim();
    switch (lineType) {
      case LineType.MOVE:
        var lineVars = this.getVariablesFromLine(line);
        var element = this.getMotionElementFromLine(line);
        if (lineVars.length > 0)
          params["target"] = lineVars[0];
        if (element)
          params["element"] = element;
        params["moves"] = line.indexOf('MOVES') === 0;
        searchWord = params["moves"] ? 'VTRAN' : 'VCRUISE';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > (index+1)) {
            tmpLine = tmpLine.substring(index+1);
            index = tmpLine.indexOf(' ');
            if (index > 0)
              tmpLine = tmpLine.substring(0,index);
            let val = Number(tmpLine);
            if (!isNaN(val))
              params["vcruise"] = val;
          }
        }
        searchWord = 'BLENDINGPERCENTAGE';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > (index+1)) {
            tmpLine = tmpLine.substring(index+1);
            index = tmpLine.indexOf(' ');
            if (index > 0)
              tmpLine = tmpLine.substring(0,index);
            let val = Number(tmpLine);
            if (!isNaN(val))
              params["blending"] = val;
          }
        }
        break;
      case LineType.CIRCLE:
        var lineVars = this.getVariablesFromLine(line);
        var element = this.getMotionElementFromLine(line);
        if (lineVars.length > 0)
          params["target"] = lineVars;
        if (element)
          params["element"] = element;
        if (lineVars.length === 1) { // CIRCLE ANGLE
          var tmp = line.replace(/=/gi,' ').trim();
          var i = tmp.indexOf('ANGLE');
          if (i>-1) {
            tmp = tmp.substring(i+5);
            var nextElements = tmp.split(' ');
            if (nextElements.length > 0) {
              for (let e of nextElements) {
                if (e.length > 0) {
                  var num = Number(e);
                  if (!isNaN(num))
                    params["angle"] = e;
                  break;
                }
              }
            }
          }
        }
        searchWord = 'VTRAN';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > (index+1)) {
            tmpLine = tmpLine.substring(index+1);
            index = tmpLine.indexOf(' ');
            if (index > 0)
              tmpLine = tmpLine.substring(0,index);
            let val = Number(tmpLine);
            if (!isNaN(val))
              params["vtran"] = val;
          }
        }
        searchWord = 'BLENDINGPERCENTAGE';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > (index+1)) {
            tmpLine = tmpLine.substring(index+1);
            index = tmpLine.indexOf(' ');
            if (index > 0)
              tmpLine = tmpLine.substring(0,index);
            let val = Number(tmpLine);
            if (!isNaN(val))
              params["blending"] = val;
          }
        }
        break;
      default:
        return null;
    }
    return params;
  }
}

export interface LineData {
  index: number;
  line: string;
  lineType: LineType;
  vars: TPVariable[];
  params: any[];
}