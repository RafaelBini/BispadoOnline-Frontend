import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'memberName'
})
export class MemberNamePipe implements PipeTransform {

  transform(name: string): string {
    var splittedName = name.split(' ')
    var count = splittedName.length;
    if (count > 3 && name.length >= 26) {
      return name.replace(splittedName[1], `${splittedName[1][0]}.`)
    }
    return name;
  }

}
