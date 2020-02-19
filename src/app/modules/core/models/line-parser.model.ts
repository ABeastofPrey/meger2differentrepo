import { DataService } from '..';
import { TPVariable } from './tp/tp-variable.model';
import { JumpxCommand } from '../../program-editor/components/combined-dialogs/models/jumpx-command.model';
import { CommandType as JumpxCommandType, CommandOptions } from '../../program-editor/components/combined-dialogs/enums/jumpx-command.enums';
import { split, filter, toLower, map, compose, prop, equals, ifElse, trim, replace } from 'ramda';
import { isNotEmpty } from 'ramda-adjunct';

enum LineType {
  MOVE,
  CIRCLE,
  PROGRAM,
  OTHER,
  JUMP,
}

/**
 * getArrIndex("P1[2]"); // => [ 'P1', 2 ]
 * getArrIndex("P1[2][100]"); // => [ 'P1', 2, 100 ]
 * @param str 
 */
export const getArrIndex = str => {
  if (typeof str !== 'string') return [];
  const isLeftMark = x => x === '[';
  const isRightMark = x => x === ']';
  const isMatch = (x, y) => isLeftMark(x) && isRightMark(y);
  const getVal = x => Number.isNaN(parseFloat(x)) ? x : parseFloat(x);
  const markStack = [];
  const result = [];
  let tempStr = '';
  [...str].forEach(x => {
    if (isLeftMark(x)) {
      isNotEmpty(tempStr) && result.push(getVal(tempStr));
      markStack.push(x);
      tempStr = '';
    } else if (isRightMark(x)) {
      if (isMatch(markStack.pop(), x)) {
        isNotEmpty(tempStr) && result.push(getVal(tempStr));
        tempStr = '';
      }
    } else {
      tempStr += x;
    }
  });
  return result;
};

export class LineParser {
  LineType = LineType;

  constructor(private data: DataService) { }

  getLineType(row: string): LineType {
    row = row.toUpperCase().trim();
    let i = row.indexOf('MOVE');
    if (i === 0) return LineType.MOVE;
    i = row.indexOf('CIRCLE');
    if (i === 0) return LineType.CIRCLE;
    i = row.indexOf('PROGRAM');
    if (i === 0) return LineType.PROGRAM;
    // for jumpx command
    const cmd = row.split(' ')[0];
    const _jump = JumpxCommandType.Jump.toUpperCase();
    const _jump3 = JumpxCommandType.Jump3.toUpperCase();
    const _jump3cp = JumpxCommandType.Jump3cp.toUpperCase();
    if (cmd === _jump || cmd === _jump3 || cmd === _jump3cp) {
      return LineType.JUMP;
    }
    return LineType.OTHER;
  }

  getVariablesFromLine(row: string): TPVariable[] {
    row = row
      .toUpperCase()
      .replace(/CIRCLEPOINT|ASCENDINGPOINT|DESCENDINGPOINT|TARGETPOINT|CIRCLECENTER|=/gi, '')
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
    let params = {
      lineType,
      line: rowIndex,
    };
    switch (lineType) {
      case LineType.MOVE: {
        line = line.toUpperCase().trim();
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
        line = line.toUpperCase().trim();
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
      case LineType.JUMP:
        const res = this.parseJumpxCommand(line);
        params = { ...params, ...res };
        break;
      default:
        return null;
    }
    return params;
  }

  private parseJumpxCommand(command: string): { commandName: JumpxCommandType, payload: JumpxCommand } {
    const cmdObj = { commandName: null, payload: { [CommandOptions.WithPls]: [] } } as { commandName: JumpxCommandType, payload: JumpxCommand };
    const isMotionElement = x => this.data.robots.includes(x) ? true : false;
    const splitSpace = split(' ');
    const hasBracket = str => str.indexOf('[') !== -1;
    const hasOnlyOne = compose(equals(1), prop('length'));
    const splitEqualMark = map(split('='));
    const filterEmpty = filter(isNotEmpty);
    const filterWithSpace = compose(filterEmpty, splitSpace);
    const isJumpx = x => {
      const cmd = compose(trim, toLower)(x);
      switch (toLower(cmd)) {
        case toLower(JumpxCommandType.Jump):
          return true;
        case toLower(JumpxCommandType.Jump3):
          return true;
        case toLower(JumpxCommandType.Jump3cp):
          return true;
        default: return false;
      }
    };
    const bindKey = ([key]) => {
      if (isJumpx(key)) {
        cmdObj.commandName = trim(key);
      } else if (isMotionElement(key)) {
        cmdObj.payload[CommandOptions.MotionElement] = key;
      } else {
        if(hasBracket(key)) {
          const [_key, index] = getArrIndex(key);
          cmdObj.payload[CommandOptions.TargetPoint] = _key;
          cmdObj.payload[CommandOptions.TargetPointIndex] = index;
        } else {
          cmdObj.payload[CommandOptions.TargetPoint] = key;
        }
      }
    };
    const bindVal = ([key, val]) => {
      const _key = toLower(key);
      if (_key === toLower(CommandOptions.AscendingPoint)) {
        if(hasBracket(val)) {
          const [_key, index] = getArrIndex(val);
          cmdObj.payload[CommandOptions.AscendingPoint] = _key;
          cmdObj.payload[CommandOptions.AscendingPointIndex] = index;
        } else {
          cmdObj.payload[CommandOptions.AscendingPoint] = val;
        }
      }
      if (_key === toLower(CommandOptions.DescendingPoint)) {
        if(hasBracket(val)) {
          const [_key, index] = getArrIndex(val);
          cmdObj.payload[CommandOptions.DescendingPoint] = _key;
          cmdObj.payload[CommandOptions.DescendingPointIndex] = index;
        } else {
          cmdObj.payload[CommandOptions.DescendingPoint] = val;
        }
      }
      if (_key === toLower(CommandOptions.TargetPoint)) {
        if(hasBracket(val)) {
          const [_key, index] = getArrIndex(val);
          cmdObj.payload[CommandOptions.TargetPoint] = _key;
          cmdObj.payload[CommandOptions.TargetPointIndex] = index;
        } else {
          cmdObj.payload[CommandOptions.TargetPoint] = val;
        }
      }
      if (_key === toLower(CommandOptions.ArchNo)) {
        cmdObj.payload[CommandOptions.ArchNo] = val;
      }
      if (_key === toLower(CommandOptions.LimZ)) {
        cmdObj.payload[CommandOptions.LimZ] = val;
      }
      if (_key === toLower(CommandOptions.BlendingPercentage)) {
        cmdObj.payload[CommandOptions.BlendingPercentage] = val;
      }
      if (_key === toLower(CommandOptions.Vcruise)) {
        cmdObj.payload[CommandOptions.Vcruise] = val;
      }
      if (_key === toLower(CommandOptions.Vtran)) {
        cmdObj.payload[CommandOptions.Vtran] = val;
      }
      if (_key === toLower(CommandOptions.Acc)) {
        cmdObj.payload[CommandOptions.Acc] = val;
      }
      if (_key === toLower(CommandOptions.WithPls)) {
        cmdObj.payload[CommandOptions.WithPls].push(val);
      }
    };
    const replaceBlank = replace(/(\s*)=(\s*)/g, '=');
    const bindTocommand = map(ifElse(hasOnlyOne, bindKey, bindVal));
    compose(bindTocommand, splitEqualMark, filterWithSpace, replaceBlank)(command);
    return cmdObj;
  }
}
