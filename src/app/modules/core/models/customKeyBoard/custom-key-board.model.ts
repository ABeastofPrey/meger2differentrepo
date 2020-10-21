export const fontRule = {
  "size": "24px",
  "family": "Roboto",
}

export enum InputType {
  Add = 'add',
  Left = 'arrow_back',
  Right = 'arrow_forward',
  Delete = 'backspace',
  Enter = 'Enter'
}

export interface CharWidth {
  "width": number;
}

export interface customKeyBoardType {
  getValue: Function;
  setValue: Function;
  getValid: Function;
}
