import { Component, OnInit } from '@angular/core';
declare var $: any;
import { Observable } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-projetos',
  templateUrl: './projetos.component.html',
  styleUrls: ['./projetos.component.css'],
  providers: [AngularFirestore]
})
export class ProjetosComponent implements OnInit {

  public projetos: Observable<any[]>;

  constructor(db: AngularFirestore) {
    this.projetos = db.collection('/projetos').valueChanges();
    console.log(this.projetos);
  }

  ngOnInit() {
    $('.collapsible').collapsible();
  }

}
