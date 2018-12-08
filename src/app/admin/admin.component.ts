import { Component, OnInit } from '@angular/core';
declare var $: any;
import { Observable } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';

declare var $:any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [AngularFirestore]
})
export class AdminComponent implements OnInit {

  public projetos: Observable<any[]>;

  constructor(db: AngularFirestore) {
    this.projetos = db.collection('/projetos').valueChanges();
    console.log(this.projetos);
  }

  ngOnInit() {
    $('.collapsible').collapsible();
  }

}
