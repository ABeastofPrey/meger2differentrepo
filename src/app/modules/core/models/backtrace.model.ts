export class Backtrace {
  taskName: string;
  taskState: number;
  files: BacktraceFile[];
  str: string;

  constructor(str: string) {
    this.str = str;
    const lines = str.split('\n');
    let files: BacktraceFile[] = [];
    let parts = lines[0].split(' ');
    this.taskName = parts[1];
    this.taskState = Number(parts[3]);
    for (let i = 1; i < lines.length; i++) {
      parts = lines[i].split(' ');
      files.push(new BacktraceFile(parts[6], Number(parts[3])));
    }
    this.files = files;
  }
}

class BacktraceFile {
  name: string;
  line: number;
  path: string;

  constructor(name: string, line: number) {
    this.line = line;
    const i = name.lastIndexOf('/');
    this.name = i > 0 ? name.substring(i + 1) : name;
    this.path = i > 0 ? name.substring(0, i + 1) : '';
  }
}
