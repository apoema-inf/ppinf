import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  providers: [AngularFirestore]
})
export class InicioComponent implements OnInit {

  public projetos: Observable<any[]>;

  constructor(private db: AngularFirestore) {
    this.projetos = this.db.collection('/projetos').valueChanges();
    console.log(this.projetos);
  }

  titulo: string = '';
  status: string;
  area: string;
  finalidade: string;

  ngOnInit() {
    $(document).ready(function () {
      $('.slider').slider();
      $('select').formSelect();
      $('.collapsible').collapsible();
    });
  }

  filterArea(string) {
    this.area = string;
  }

}
