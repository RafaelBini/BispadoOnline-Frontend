import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { BuscarMembroDialogComponent } from 'src/app/dialogs/buscar-membro-dialog/buscar-membro-dialog.component';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-editar-discursos',
  templateUrl: './editar-discursos.component.html',
  styleUrls: ['./editar-discursos.component.css']
})
export class EditarDiscursosComponent implements OnInit {

  constructor(
    private http: HttpService,
    private dialog: MatDialog,
    private snack: MatSnackBar
  ) { }

  sacramentais: any[] = []
  currentSunday = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * (7 - new Date().getDay()))).toDateString();

  async ngOnInit() {
    await this.loadSacramentais();
  }

  async loadSacramentais() {
    this.sacramentais = []
    var startDate = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 7 * 1)).toLocaleDateString('en-CA');
    var endDate = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30 * 4)).toLocaleDateString('en-CA');
    var speeches = await this.http.post('speeches_view_fetch', {
      whereStr: `sacramental_date between '${startDate}' and '${endDate}' and (speech_user_id=${this.http.me.id} or speech_user_id is null)`
    })

    for (let speech of speeches) {
      var sacramentalIndex = this.sacramentais.findIndex(s => s.id == speech.sacramentalId)
      if (sacramentalIndex == -1) {
        var sacramental: any = {
          id: speech.sacramentalId,
          date: speech.sacramentalDate,
          sundayOfTheMonth: speech.sundayOfTheMonth,
          speeches: []
        }
        if (speech.speechId) sacramental.speeches.push(speech)
        this.sacramentais.push(sacramental)
      }
      else {
        this.sacramentais[sacramentalIndex].speeches.push(speech)
        this.sacramentais[sacramentalIndex].speeches.sort((a: any, b: any) => a.minutes - b.minutes)
      }
    }
    this.sacramentais = this.sacramentais.sort((a, b) => a.id - b.id
    );
  }

  async drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    try {

      var prevSacramental = this.sacramentais[+event.previousContainer.id.charAt(event.previousContainer.id.length - 1)]
      var currSacramental = this.sacramentais[+event.container.id.charAt(event.container.id.length - 1)]

      if (prevSacramental.id != currSacramental.id) {
        await this.http.post('speeches/set', {
          id: currSacramental.speeches[event.currentIndex].speechId,
          sacramentalId: currSacramental.id
        });
      }


    }
    catch (ex) {
      this.snack.open('Falha ao salvar alteraão', undefined, { duration: 5500 })
      console.log(ex)
    }
  }

  buscarMembro(speech: any) {
    var ref = this.dialog.open(BuscarMembroDialogComponent, {

    })

    ref.afterClosed().subscribe(async membro => {
      try {
        await this.http.post('speeches/set', { id: speech.speechId, memberId: membro.id });
        speech.memberId = membro.id
        speech.memberName = membro.name
      }
      catch (ex) {
        this.snack.open('Falha ao alterar discursante', undefined, { duration: 3500 })
        console.log(ex)
      }
    })
  }

  deleteSpeech(sacramental: any, speechIndex: number) {
    var ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Tem certeza que irá deletar discurso?'
      }
    })

    ref.afterClosed().subscribe(async r => {
      if (!r) return;

      try {
        await this.http.delete('speeches/' + sacramental.speeches[speechIndex].speechId);
        sacramental.speeches.splice(speechIndex, 1)
      }
      catch (ex) {
        this.snack.open('Falha ao deletar', undefined, { duration: 3500 })
        console.log(ex)
      }


    })
  }

  addDefault(sacramental: any) {

    if (sacramental.sundayOfTheMonth == 1) {
      this.addBlankSpeech(sacramental)
      return;
    }

    for (var i = 1; i <= 3; i++) {
      this.addBlankSpeech(sacramental, (i * 5))
    }
  }

  async addBlankSpeech(sacramental: any, minutes: number | null = null) {
    var speech = {
      isWildCard: false,
      memberId: null,
      topic: null,
      minutes: minutes,
      reference: null,
      sacramentalId: sacramental.id,
      messageCopied: false
    }
    try {
      var result = await this.http.post('speeches/add', speech);

      sacramental.speeches.push({
        ...speech,
        speechId: result
      })

    }
    catch (ex) {
      console.log(ex)
      this.snack.open('Falha ao inserir discurso', undefined, { duration: 3400 })
    }

  }

  async updateSpeech(speech: any, field: string) {
    try {
      var theSpeech: any = {
        id: speech.speechId
      };
      theSpeech[field] = speech[field];
      await this.http.post('speeches/set', theSpeech);
    }
    catch (ex) {
      this.snack.open('Falha ao atualizar dados', undefined, { duration: 3500 })
      console.log(ex)
    }
  }

  isCurrentSacramental(sacramental: any) {

    return new Date(sacramental.date).toDateString() == this.currentSunday;
  }

}
