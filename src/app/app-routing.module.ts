import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { AuthGuard } from './guards/auth.guard';
import { EditarDiscursosComponent } from './pages/discursos/editar-discursos/editar-discursos.component';
import { VisualizarDiscursosComponent } from './pages/discursos/visualizar-discursos/visualizar-discursos.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: MainPageComponent, canActivate: [AuthGuard] },
  { path: 'main', component: MainPageComponent, canActivate: [AuthGuard] },
  { path: 'discursos/editar', component: EditarDiscursosComponent, canActivate: [AuthGuard] },
  { path: 'discursos', component: VisualizarDiscursosComponent, canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
