import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';


@Component({
  selector: 'app-buscar-membro-dialog',
  templateUrl: './buscar-membro-dialog.component.html',
  styleUrls: ['./buscar-membro-dialog.component.css']
})
export class BuscarMembroDialogComponent implements OnInit {

  constructor(
    private db: HttpService,
    public dialogRef: MatDialogRef<BuscarMembroDialogComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  term = ''
  membrosFixed: any[] = []
  membros: any[] = []
  orderByField = 'lastSpeech'
  orderByDesc = true

  async ngOnInit() {
    this.membrosFixed = await this.db.post('detailed_members_view/fetch', { whereStr: `` })
    this.membrosFixed = this.membrosFixed.sort((a, b) => a.name > b.name ? 1 : -1)
    this.membros = JSON.parse(JSON.stringify(this.membrosFixed));

  }

  async reload() {
    var theTerm = this.term.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase();
    var terms = theTerm.split(' ');

    this.membros = this.membrosFixed.filter(m => {

      for (let term of terms) {
        if (m.minutes == term) return true;

        if (!m.name.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toUpperCase().includes(term)) return false;


      }

      return true
    })
      .sort((a, b) => {

        if (a[this.orderByField] == null) return (this.orderByDesc ? -1 : 1)
        else if (b[this.orderByField] == null) return (this.orderByDesc ? 1 : -1)

        return a[this.orderByField] > b[this.orderByField] ? (this.orderByDesc ? 1 : -1) : (this.orderByDesc ? -1 : 1)

      })
  }

  selectMember(membro: any) {
    this.dialogRef.close(membro)
  }

  orderBy(field: string) {
    if (field == this.orderByField) this.orderByDesc = !this.orderByDesc

    this.orderByField = field;

    this.reload()

  }

}
