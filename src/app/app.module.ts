import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';


// HTTP
import { HttpClient, HttpClientModule } from '@angular/common/http';

// MATERIAL
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatNativeDateModule } from '@angular/material/core';

// CDK
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ClipboardModule } from '@angular/cdk/clipboard';

// HTTP Interceptor 
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './interceptors/token.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditarDiscursosComponent } from './pages/discursos/editar-discursos/editar-discursos.component';
import { LoginComponent } from './pages/login/login.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { VisualizarDiscursosComponent } from './pages/discursos/visualizar-discursos/visualizar-discursos.component';
import { CustomDatePipe } from './pipes/custom-date.pipe';
import { BuscarMembroDialogComponent } from './dialogs/buscar-membro-dialog/buscar-membro-dialog.component';
import { MemberNamePipe } from './pipes/member-name.pipe';
import { FullDatePipe } from './pipes/full-date.pipe';
import { CarregarDadosMembrosDialogComponent } from './dialogs/carregar-dados-membros-dialog/carregar-dados-membros-dialog.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { HeaderComponent } from './parts/header/header.component';


const MATERIAL_MODULES = [
  MatSnackBarModule, MatButtonModule, MatStepperModule, MatIconModule, MatCheckboxModule,
  MatTableModule, MatSortModule, MatDialogModule, MatTooltipModule, MatMenuModule,
  MatPaginatorModule, MatProgressSpinnerModule, MatSelectModule,
  MatNativeDateModule
]

const CDK_MODULES = [
  DragDropModule, ClipboardModule
]


@NgModule({
  declarations: [
    AppComponent,
    EditarDiscursosComponent,
    LoginComponent,
    MainPageComponent,
    VisualizarDiscursosComponent,
    CustomDatePipe,
    BuscarMembroDialogComponent,
    MemberNamePipe,
    FullDatePipe,
    CarregarDadosMembrosDialogComponent,
    ConfirmDialogComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ...CDK_MODULES,
    ...MATERIAL_MODULES
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    CustomDatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
