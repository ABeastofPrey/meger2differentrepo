import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'passPipe'
})
export class PassPipe implements PipeTransform {

  transform(value: string) : string {
    let passStr = '';
    for (let i = 0; i < value.length; i++) {
      passStr += '*';
    }
    return passStr;
  }

}
