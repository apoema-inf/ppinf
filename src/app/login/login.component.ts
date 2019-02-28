import { Component, OnInit } from '@angular/core';
import { Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
declare var M: any;
declare var $: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string;
  password: string;

  constructor(
    private authService: AuthService,
    public router: Router
  ) { }

  ngOnInit() {
  }

  onSubmitLogin() {
    // Show full page LoadingOverlay
    $.LoadingOverlay("show");
    this.authService.loginEmail(this.email, this.password)
      .then((res) => {
        $.LoadingOverlay("hide");
        this.router.navigate(['/admin']);
        M.toast({ html: 'Usuário Autenticado!', classes: 'rounded' });
      }).catch((err) => {
        $.LoadingOverlay("hide");
        this.router.navigate(['/login']);
        M.toast({ html: 'Email ou senha incorretos', classes: 'rounded' });
      });
  }

}
