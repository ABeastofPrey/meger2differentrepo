import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'passPipe'
})
export class PassPipe implements PipeTransform {

  transform(value: string) : string {
    return [...value].reduce(acc => acc += '*', '');
  }

}
