import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from 'src/app/services/http.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  email: string = 'rfabini1996@gmail.com';
  emailSent = false;
  token = '';

  constructor(
    private http: HttpService,
    private snack: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  private redirect: string = '';

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(p => {
      if (p.get('redirect') != null) {
        this.redirect = '/' + p.get('redirect')!;

      }

    })
  }

  async sendEmailToken() {
    try {
      var result = await this.http.post('send-email-token', { email: this.email });
      this.snack.open('Email enviado!', undefined, { duration: 3500 });
      this.emailSent = true;
    }
    catch (ex) {
      this.snack.open('Falha ao tentar enviar email', undefined, { duration: 3500 });
      console.log(ex);
    }


  }

  async enter() {
    try {
      var result = await this.http.post('validate-email-token', { email: this.email, token: this.token });

      if (result.jwt_token) {
        localStorage.setItem('api_token', result.jwt_token);
        this.router.navigate([this.redirect]);
      }
    }
    catch (ex) {
      this.snack.open('Token invalido', undefined, { duration: 3500 });
      console.log(ex);
    }


  }

}
