export const fontRule = {
  "size": "24px",
  "family": "Roboto",
}

export enum InputType {
  Add = 'add',
  Left = 'arrow_back',
  Right = 'arrow_forward',
  Top = 'arrow_upward',
  Bottom = 'arrow_downward',
  Delete = 'backspace',
  Enter = 'Enter',
  Forward  = 'forward',
  Symbol = 'keyboardSymbol',
  Back = 'keyboardBack'
}

export enum CommandLocalType {
    CommandIndex = "commandIndex",
    CommandList = "commandList"
}

export interface CharWidth {
  "width": number;
}

export interface customKeyBoardType {
    getValue:Function;
    setValue:Function;
    getValid:Function; 
    setDefaultValue:Function;
    isProgram: boolean;
}

export const LAYOUT_NUMBER: string[][] = [
    ["7", "8", "9", InputType.Delete],
    ["4", "5", "6", "-"],
    ["1", "2", "3", InputType.Enter],
    ["0", ".", InputType.Left, InputType.Right]
]

export const LAYOUT_STRING_LOWER: string[][] = [
    ["1","2","3","4","5","6","7","8","9","0",InputType.Delete],
    ["q","w","e","r","t","y","u","i","o","p","'"],
    ["a","s","d","f","g","h",'j',"k","l","_"],
    [InputType.Forward,"z","x","c","v","b","n","m",".","?","="],
    [InputType.Symbol," ",InputType.Left,InputType.Top,InputType.Right,InputType.Enter],
    [InputType.Bottom]
]

export const LAYOUT_STRING_CAPITAL: string[][] = [
    ["1","2","3","4","5","6","7","8","9","0",InputType.Delete],
    ["Q","W","E","R","T","Y","U","I","O","P","'"],
    ["A","S","D","F","G","H",'J',"K","L","_"],
    [InputType.Forward,"Z","X","C","V","B","N","M",".","?","="],
    [InputType.Symbol," ",InputType.Left,InputType.Top,InputType.Right,InputType.Enter],
    [InputType.Bottom]
]

export const LAYOUT_STRING_SYMBOL: string[][] = [
    ["1","2","3","4","5","6","7","8","9","0",InputType.Delete],
    ["!","@","#","$","%","^","&","*","(",")","'"],
    ["~","{","}","[","]","\\","|","+","-","_"],
    ["`","<",">",",","/","\"",":",";",".","?","="],
    [InputType.Back," ",InputType.Left,InputType.Top,InputType.Right,InputType.Enter],
    [InputType.Bottom]
]

export enum DATA_TYPE {
    Float="float",
    Int="int",
    String="string"
}
