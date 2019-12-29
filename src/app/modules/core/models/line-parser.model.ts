import { DataService } from '..';
import { TPVariable } from './tp/tp-variable.model';

enum LineType {
  MOVE,
  CIRCLE,
  PROGRAM,
  OTHER,
}

export class LineParser {
  LineType = LineType;

  constructor(private data: DataService) {}

  getLineType(row: string): LineType {
    row = row.toUpperCase().trim();
    let i = row.indexOf('MOVE');
    if (i === 0) return LineType.MOVE;
    i = row.indexOf('CIRCLE');
    if (i === 0) return LineType.CIRCLE;
    i = row.indexOf('PROGRAM');
    if (i === 0) return LineType.PROGRAM;
    return LineType.OTHER;
  }

  getVariablesFromLine(row: string): TPVariable[] {
    row = row
      .toUpperCase()
      .replace(/CIRCLEPOINT|TARGETPOINT|CIRCLECENTER|=/gi, '')
      .trim();
    const result: TPVariable[] = [];
    const tmp = row.split(' ');
    if (tmp.length <= 1) return [];
    const varList: TPVariable[] = this.data.joints.concat(this.data.locations);
    for (let i = 1; i < tmp.length; i++) {
      if (tmp[i].length === 0 || (i === 1 && this.data.robots.includes(tmp[i]))) {
        continue;
      }
      let varIndex = -1;
      const bracket = tmp[i].indexOf('[');
      if (bracket > -1 && bracket < tmp[i].length - 1) {
        const tmpIndex = tmp[i]
          .substring(bracket + 1)
          .slice(0, -1)
          .trim();
        if (tmpIndex.length > 0) varIndex = Number(tmpIndex);
        else continue;
        if (isNaN(varIndex)) {
          varIndex = -1;
          continue;
        }
        tmp[i] = tmp[i].substring(0, bracket);
      } else if (bracket > -1) continue;
      for (const v of varList) {
        if (tmp[i] === v.name) {
          if (v.isArr && (v.value as TPVariable[]).length < varIndex) {
            continue;
          }
          const varCopy = Object.assign({}, v);
          varCopy.selectedIndex = varIndex;
          result.push(varCopy);
        }
      }
    }
    return result;
  }

  getMotionElementFromLine(row: string): string {
    row = row
      .toUpperCase()
      .replace(/CIRCLEPOINT|CIRCLECENTER|TARGETPOINT|=/gi, '')
      .trim();
    const tmp = row.split(' ');
    if (tmp.length < 2) return null;
    let i = 1;
    while (i < tmp.length && tmp[i].length === 0) i++;
    if (tmp[i].length === 0) return null;
    return this.data.robots.includes(tmp[i]) ? tmp[i] : null;
  }

  getLineParameters(line: string, lineType: LineType, rowIndex: number) {
    let searchWord: string;
    let index: number;
    const params = {
      lineType,
      line: rowIndex,
    };
    line = line.toUpperCase().trim();
    switch (lineType) {
      case LineType.MOVE: {
        const lineVars = this.getVariablesFromLine(line);
        const element = this.getMotionElementFromLine(line);
        if (lineVars.length > 0) params['target'] = lineVars[0];
        if (element) params['element'] = element;
        params['moves'] = line.indexOf('MOVES') === 0;
        searchWord = params['moves'] ? 'VTRAN' : 'VCRUISE';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > index + 1) {
            tmpLine = tmpLine.substring(index + 1);
            index = tmpLine.indexOf(' ');
            if (index > 0) tmpLine = tmpLine.substring(0, index);
            const val = Number(tmpLine);
            if (!isNaN(val)) params['vcruise'] = val;
          }
        }
        searchWord = 'BLENDINGPERCENTAGE';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > index + 1) {
            tmpLine = tmpLine.substring(index + 1);
            index = tmpLine.indexOf(' ');
            if (index > 0) tmpLine = tmpLine.substring(0, index);
            const val = Number(tmpLine);
            if (!isNaN(val)) params['blending'] = val;
          }
        }
        break;
      }
      case LineType.CIRCLE: {
        const lineVars = this.getVariablesFromLine(line);
        const element = this.getMotionElementFromLine(line);
        if (lineVars.length > 0) params['target'] = lineVars;
        if (element) params['element'] = element;
        searchWord = 'ANGLE';
        index = line.indexOf(searchWord);
        if (index !== 1) {
          // CIRCLE ANGLE
          let tmp = line.replace(/=/gi, ' ').trim();
          const i = tmp.indexOf('ANGLE');
          tmp = tmp.substring(i + 5);
          const nextElements = tmp.split(' ');
          if (nextElements.length > 0) {
            for (const e of nextElements) {
              if (e.length > 0) {
                params['angle'] = e;
                break;
              }
            }
          }
        }
        searchWord = 'VTRAN';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > index + 1) {
            tmpLine = tmpLine.substring(index + 1);
            index = tmpLine.indexOf(' ');
            if (index > 0) tmpLine = tmpLine.substring(0, index);
            const val = Number(tmpLine);
            if (!isNaN(val)) params['vtran'] = val;
          }
        }
        searchWord = 'BLENDINGPERCENTAGE';
        index = line.indexOf(searchWord);
        if (index > 0) {
          let tmpLine = line.substring(index + searchWord.length);
          index = tmpLine.indexOf('=');
          if (index >= 0 && tmpLine.length > index + 1) {
            tmpLine = tmpLine.substring(index + 1);
            index = tmpLine.indexOf(' ');
            if (index > 0) tmpLine = tmpLine.substring(0, index);
            const val = Number(tmpLine);
            if (!isNaN(val)) params['blending'] = val;
          }
        }
        break;
      }
      default:
        return null;
    }
    return params;
  }
}
