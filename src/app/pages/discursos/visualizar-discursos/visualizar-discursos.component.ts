import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from './../../../services/http.service';
import { Component, OnInit } from '@angular/core';
import { CustomDatePipe } from 'src/app/pipes/custom-date.pipe';

@Component({
  selector: 'app-visualizar-discursos',
  templateUrl: './visualizar-discursos.component.html',
  styleUrls: ['./visualizar-discursos.component.css']
})
export class VisualizarDiscursosComponent implements OnInit {

  constructor(
    private http: HttpService,
    private snack: MatSnackBar,
    private customDatePipe: CustomDatePipe
  ) { }

  speeches: any[] = [];
  domingoSelecionado = new Date(new Date().getTime() + (1000 * 60 * 60 * 24 * (7 - new Date().getDay()))).toLocaleDateString('en-CA').replace(/-/g, '')
  domingos: any[] = []
  loading = false

  async ngOnInit() {
    console.log(this.domingoSelecionado)
    try {
      this.loading = true
      await this.loadDomingos()
      await this.reload()
    }
    catch (ex) {
      console.log(ex)
      this.snack.open('Falha ao carregar dados', undefined, { duration: 30000 })
    }
    finally {
      this.loading = false;
    }


  }

  async loadDomingos() {
    this.domingos = await this.http.get('sacramentals')
  }

  async reload() {
    this.loading = true
    try {
      this.speeches = await this.http.post('speeches_view_fetch', {
        whereStr: `sacramental_id = '${this.domingoSelecionado}' and speech_User_Id='${this.http.me.id}' order by minutes asc`
      })
    }
    catch (ex) {
      console.log(ex)
      this.snack.open('Falha ao carregar dados', undefined, { duration: 30000 })
    }
    finally {
      this.loading = false;
    }
  }

  notifyCopy(speech: any) {
    speech.messageCopied = true;
    this.snack.open('Copiado!', undefined, { duration: 3400 })
  }

  getInviteText(speech: any) {
    return `Olá Irmão(ã) ${speech.isWildCard ? speech.wildText : speech.memberName},\n\nEm espírito de oração, o bispado da Ala Parque da Fonte ponderou o seu nome para discursar na reunião sacramental no dia *${this.customDatePipe.transform(speech.sacramentalDate)}*.\n\nAbaixo estão os detalhes do discurso:\n\nTema: *${speech.topic}* ${speech.reference ? `\n\nReferência: ${speech.reference}` : ''}\n\nDuração: *${speech.minutes} minutos*\n\n*Importante: Lembre-se de assentar-se ao púlpito antes de discursar\n\nVocê aceita o convite?`;
  }

}
