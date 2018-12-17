import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { Projeto } from '../models/projeto.model';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from 'angularfire2/storage';
declare var $: any;

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  providers: [AngularFirestore]
})
export class InicioComponent implements OnInit {

  projetos: Observable<Projeto[]>;
  downloadURL: Observable<any>;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.projetos = db.collection('projetos').snapshotChanges().pipe(map(

      changes => {

        return changes.map(

          a => {

            const data = a.payload.doc.data() as Projeto;

            data.id = a.payload.doc.id;

            return data;

          });
      }));
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
