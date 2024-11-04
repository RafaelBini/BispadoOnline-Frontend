import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
  constructor(

  ) { }

  transform(value: string): string {
    return new Date(value).toLocaleDateString('pt-BR').substring(0, 5)
  }

}
