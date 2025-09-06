import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { HttpService } from 'src/app/services/http.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'app-buscar-membro-dialog',
  templateUrl: './buscar-membro-dialog.component.html',
  styleUrls: ['./buscar-membro-dialog.component.css']
})
export class BuscarMembroDialogComponent implements OnInit {

  constructor(
    private db: HttpService,
    public dialogRef: MatDialogRef<BuscarMembroDialogComponent>,
    private dialog: MatDialog
    //@Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  term = ''
  membrosFixed: any[] = []
  membros: any[] = []
  orderByField = 'lastSpeech'
  orderByDesc = true
  archiveMode = false

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

        if (a[this.orderByField] == null) return (this.orderByDesc ? 1 : -1)
        else if (b[this.orderByField] == null) return (this.orderByDesc ? -1 : 1)

        return a[this.orderByField] > b[this.orderByField] ? (this.orderByDesc ? 1 : -1) : (this.orderByDesc ? -1 : 1)

      })
  }

  selectMember(membro: any) {
    if (this.archiveMode) {
      var ref = this.dialog.open(ConfirmDialogComponent, {
        data: {
          isDanger: true,
          title: `Arquivar (deletar) ${membro.name}`,
          content: 'Voce tem certeza de que deseja arquivar este membro?'
        }
      })
      ref.afterClosed().subscribe(async confirmed => {
        if (confirmed) {

          try {
            await this.db.post('members/set', { id: membro.id, archived: 'true' });
            this.membros = this.membros.filter(m => m.id != membro.id);
          }
          catch (ex) {
            console.log(ex)
          }
        }
      })
    }
    else {
      this.dialogRef.close(membro)
    }

  }

  orderBy(field: string) {
    if (field == this.orderByField) this.orderByDesc = !this.orderByDesc

    this.orderByField = field;

    this.reload()

  }

}
