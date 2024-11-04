import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-carregar-dados-membros-dialog',
  templateUrl: './carregar-dados-membros-dialog.component.html',
  styleUrls: ['./carregar-dados-membros-dialog.component.css']
})
export class CarregarDadosMembrosDialogComponent implements OnInit {

  constructor(
    private http: HttpService,
    private snack: MatSnackBar
  ) { }

  loginObj = {
    churchUser: "rfabini",
    churchPass: "",
    unitNumber: "2033348"
  }

  isLoading = false;
  message = '';

  ngOnInit(): void {
  }

  async requestLoad() {
    this.isLoading = true
    this.message = ''
    try {
      var result = await this.http.post('load-members-data', this.loginObj)
      this.message = 'Dados carregados com sucesso!!'
      this.snack.open('Dados carregados com sucesso!!', undefined, { duration: 8500 })
    }
    catch (ex) {
      console.log(ex)
      this.message = 'Falha ao carregar dados (ver logs no console)';
      this.snack.open('Falha ao carregar dados (ver logs no console)', undefined, { duration: 3500 })
    }
    finally {
      this.isLoading = false;
    }


  }

}
