import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

declare var $:any;

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  isAdmin = false;

  constructor(private router:Router, private authService: AuthService) {
  }
  ngOnInit() {
    this.authService.getAuth().subscribe( auth => {
      if (auth) {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    });
      $('.sidenav').sidenav();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/inicio']);
  }

}
