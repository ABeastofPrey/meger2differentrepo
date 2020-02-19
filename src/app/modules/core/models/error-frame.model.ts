export class ErrorFrame {

  errType: string;
  errCode: string;
  errMsg: string;
  errTask: string;
  errLine: string;
  errModule: string;
  errUUID: string;
  msg: string;

  constructor(private errString: string) {
    this.msg = errString;
    let i = errString.indexOf(':');
    this.errType = errString
      .substr(0, i)
      .trim()
      .toUpperCase();
    errString = errString.substr(i + 1);
    i = errString.indexOf(',');
    this.errCode = errString.substr(0, i).trim();
    i = errString.indexOf('"');
    errString = errString.substr(i + 1);
    i = errString.indexOf('"');
    this.errMsg = errString.substr(0, i);
    errString = errString.substr(i + 2);
    const parts = errString.split(',');
    if (parts.length < 3) return;
    i = parts[0].indexOf('"');
    this.errTask = parts[0].substr(parts[0].indexOf(':') + 1).trim();
    i = parts[1].indexOf(':');
    if (i > 0) {
      this.errLine = parts[1].substr(i + 1).trim();
      this.errModule = parts[2].substr(parts[2].indexOf(':') + 1).trim();
      if (parts[3]) {
        this.errUUID = parts[3].substr(parts[3].indexOf(':')+1).trim();
      }
    } else {
      this.errTask += ',' + parts[1];
      i = parts[2].indexOf(':');
      this.errLine = parts[2].substr(i + 1).trim();
      this.errModule = parts[3].substr(parts[3].indexOf(':') + 1).trim();
      if (parts[4]) {
        this.errUUID = parts[4].substr(parts[4].indexOf(':')+1).trim();
      }
    }
  }
}
