import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CarregarDadosMembrosDialogComponent } from 'src/app/dialogs/carregar-dados-membros-dialog/carregar-dados-membros-dialog.component';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css']
})
export class MainPageComponent implements OnInit {

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  loadMemberData() {
    this.dialog.open(CarregarDadosMembrosDialogComponent);

  }

}
