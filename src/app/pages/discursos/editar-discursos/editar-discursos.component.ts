import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Title } from '@angular/platform-browser';
import { BuscarMembroDialogComponent } from 'src/app/dialogs/buscar-membro-dialog/buscar-membro-dialog.component';
import { ConfirmDialogComponent } from 'src/app/dialogs/confirm-dialog/confirm-dialog.component';
import { HttpService } from 'src/app/services/http.service';
import { GoogleDriveAuthService, GoogleDriveTokens } from 'src/app/services/google-drive-auth.service';

@Component({
  selector: 'app-editar-discursos',
  templateUrl: './editar-discursos.component.html',
  styleUrls: ['./editar-discursos.component.css']
})
export class EditarDiscursosComponent implements OnInit {

  constructor(
    private http: HttpService,
    private dialog: MatDialog,
    private snack: MatSnackBar,
    private googleAuth: GoogleDriveAuthService
  ) { }

  sacramentais: any[] = []
  currentSunday = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * (7 - new Date().getDay()))).toDateString();
  numReunioesAnteriores = 1;
  private approveClickCount = 0;
  private approveClickTimer: ReturnType<typeof setTimeout> | null = null;
  private approveClickSacramentalId: string | number | null = null;

  async ngOnInit() {
    await this.loadSacramentais();
  }

  async loadSacramentais() {
    this.sacramentais = []
    var startDate = new Date(new Date().getTime() - (1000 * 60 * 60 * 24 * 7 * this.numReunioesAnteriores)).toLocaleDateString('en-CA');
    var endDate = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * 30 * 4)).toLocaleDateString('en-CA');
    var speeches = await this.http.post('speeches_view_fetch', {
      whereStr: `sacramental_date between '${startDate}' and '${endDate}' and (speech_user_id=${this.http.me.id} or speech_user_id is null) order by sacramental_id, order_num`
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
        this.sacramentais[sacramentalIndex].speeches
      }
    }
    this.sacramentais = this.sacramentais.sort((a, b) => a.id - b.id
    );
  }

  loadPreviousMeetings() {
    this.numReunioesAnteriores += 5
    this.loadSacramentais();
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

      var i = 1;
      for (let speech of currSacramental.speeches) {
        await this.http.post('speeches/set', {
          id: speech.speechId,
          sacramentalId: currSacramental.id,
          orderNum: i
        });
        i++;
      }



    }
    catch (ex) {
      this.snack.open('Falha ao salvar alteraão', undefined, { duration: 5500 })
      console.log(ex)
    }
  }

  onSacramentalTitleClick(sacramental: any) {
    if (this.approveClickSacramentalId !== sacramental.id) {
      this.approveClickCount = 0;
      this.approveClickSacramentalId = sacramental.id;
    }

    this.approveClickCount++;

    if (this.approveClickTimer) {
      clearTimeout(this.approveClickTimer);
    }

    this.approveClickTimer = setTimeout(() => {
      this.approveClickCount = 0;
      this.approveClickSacramentalId = null;
      this.approveClickTimer = null;
    }, 600);

    if (this.approveClickCount >= 3) {
      if (this.approveClickTimer) {
        clearTimeout(this.approveClickTimer);
      }
      this.approveClickCount = 0;
      this.approveClickSacramentalId = null;
      this.approveClickTimer = null;
      this.approve(sacramental);
    }
  }

  async approve(sacramental: any) {
    try {
      for (const speech of sacramental.speeches) {
        await this.http.post('speeches/set', { id: speech.speechId, approved: true });
        speech.approved = true;
      }

      const sortedSpeeches = [...sacramental.speeches].sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
      const speakerName = (speech: any) => {
        if (!speech) return '';
        return speech.isWildCard ? (speech.wildText || '').trim() : (speech.memberName || '').trim();
      };

      const sacramentalDate = new Date(sacramental.date).toLocaleDateString('en-CA');
      const name1 = speakerName(sortedSpeeches[0]);

      if (!name1) {
        this.snack.open('Discursos aprovados! Informe o nome do 1º discursante para atualizar a ata.', undefined, { duration: 6500 });
        return;
      }

      let tokens: GoogleDriveTokens;
      try {
        tokens = await this.googleAuth.ensureAuthenticated(false);
      } catch (authEx: any) {
        this.snack.open('Discursos aprovados, mas ' + (authEx?.message || 'login do Google Drive é necessário para atualizar a ata.'), undefined, { duration: 7000 });
        return;
      }

      try {
        await this.sendDiscursantesToAta(tokens, sacramentalDate, name1, speakerName(sortedSpeeches[1]), speakerName(sortedSpeeches[2]));
        this.snack.open('Discursos aprovados e ata sacramental atualizada!', undefined, { duration: 7000 });
      } catch (ataEx: any) {
        this.snack.open('Discursos aprovados, mas ' + (ataEx?.message || 'falha ao atualizar a ata no Google Drive.'), undefined, { duration: 7500 });
      }
    } catch (ex: any) {
      console.log(ex);
      this.snack.open(ex?.message || 'Falha ao aprovar discursos.', undefined, { duration: 6500 });
    }
  }

  private async sendDiscursantesToAta(
    tokens: GoogleDriveTokens,
    sacramentalDate: string,
    discursante1: string,
    discursante2: string,
    discursante3: string,
    retried = false
  ): Promise<void> {
    try {
      const result = await this.http.post('add-discursantes-ata', {
        sacramental_date: sacramentalDate,
        discursante_1: discursante1,
        discursante_2: discursante2 || undefined,
        discursante_3: discursante3 || undefined,
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token,
      });

      if (result.refreshedTokens) {
        this.googleAuth.saveTokens(result.refreshedTokens);
      }
    } catch (ex: any) {
      const body = ex?.error;
      if (body?.googleAuthRequired && !retried) {
        this.googleAuth.clearTokens();
        const newTokens = await this.googleAuth.ensureAuthenticated(true);
        return this.sendDiscursantesToAta(newTokens, sacramentalDate, discursante1, discursante2, discursante3, true);
      }
      throw new Error(body?.message || body?.msg || 'falha ao atualizar a ata no Google Drive.');
    }
  }

  buscarMembro(speech: any) {
    var ref = this.dialog.open(BuscarMembroDialogComponent, {

    })

    ref.afterClosed().subscribe(async membro => {
      try {
        if (!membro) return;

        await this.http.post('speeches/set', { id: speech.speechId, memberId: membro.id, approved: false });
        speech.memberId = membro.id
        speech.memberName = membro.name
        speech.approved = false
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

  async addDefault(sacramental: any) {

    if (sacramental.sundayOfTheMonth == 1) {
      this.addBlankSpeech(sacramental)
      return;
    }

    for (var i = 1; i <= 3; i++) {
      await this.addBlankSpeech(sacramental, (i * 5), i)
    }
  }

  async addBlankSpeech(sacramental: any, minutes: number | null = null, orderNum: number = 1) {
    var speech = {
      isWildCard: false,
      memberId: null,
      topic: null,
      minutes: minutes,
      reference: null,
      sacramentalId: sacramental.id,
      messageCopied: false,
      orderNum
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

  isSacramentalApproved(sacramental: any) {
    if (!sacramental.speeches?.length) return false;
    return sacramental.speeches.every((speech: any) => speech.approved === true);
  }

}
