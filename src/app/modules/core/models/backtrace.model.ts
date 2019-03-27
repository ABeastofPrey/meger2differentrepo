export class Backtrace {
  
  taskName: string;
  taskState: number;
  files: BacktraceFile[];
  str: string;
  
  constructor(str: string) {
    this.str = str;
    const lines = str.split('\n');
    let files : BacktraceFile[] = [];
    let parts = lines[0].split(' ');
    this.taskName = parts[1];
    this.taskState = Number(parts[3]);
    for (let i = 1; i < lines.length; i++) {
      parts = lines[i].split(' ');
      files.push({
        name: parts[6],
        line: Number(parts[3]) - 1
      });
    }
    this.files = files;
  }
  
  
}

interface BacktraceFile {
  name: string;
  line: number;
}