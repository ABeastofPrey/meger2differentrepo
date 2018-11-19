import { Pipe, PipeTransform } from '@angular/core';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';

@Pipe({ name: 'dataNotArray' })
/**
 * The pipe to remove array from TPVariable collection.
 */
export class DataNotArrayPipe implements PipeTransform {
  transform(allData: TPVariable[]) {
    return allData.filter(data => !(data.isArr));
  }
}
