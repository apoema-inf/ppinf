import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { Projeto } from '../models/projeto.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

declare var $: any;
declare var M: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [AngularFirestore]
})
export class AdminComponent implements OnInit {

  projeto: Projeto = new Projeto();
  findOneId: any;
  projetos: Observable<Projeto[]>;

  constructor(public db: AngularFirestore) {
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

  ngOnInit() {
    $('.collapsible').collapsible();
    $('.modal').modal();
    $('select').formSelect();
  }

  closeModal(string) {
    $('#' + string).modal({ dismissible: true });
  }

  createProjeto() {
    console.log(this.projeto);

    this.db.collection("projetos").add({
      titulo: this.projeto.titulo,
      status: this.projeto.status,
      finalidade: this.projeto.finalidade,
      financiamento: this.projeto.aporte,
      area: this.projeto.area,
      equipe: { coordenador: this.projeto.coordenador, membros: this.projeto.membros },
      aplicabilidade: { contexto: this.projeto.contexto }
    })
      .then(function (docRef) {
        $('#create').modal({ dismissible: true });
        M.toast({ html: 'Projeto criado com sucesso!', classes: 'rounded' });
      })
      .catch(function (error) {
        M.toast({ html: error, classes: 'rounded' });
      });
  }

  findOne(string) {
    var docRef = this.db.collection("projetos").doc(string);

    docRef.ref.
      get().then(documentSnapshot => {
        if (documentSnapshot.exists) {
          this.findOneId = documentSnapshot.data();
          this.findOneId.id = documentSnapshot.id;
          console.log("Document data:", documentSnapshot.data());
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      });
  }

  deletarProjeto(string) {
    this.db.collection("projetos").doc(string).delete().then(function () {
      $('#delete').modal({ dismissible: true });
      M.toast({ html: 'Projeto deletado com sucesso!', classes: 'rounded' });
    }).catch(function (error) {
      console.log(error);
      M.toast({ html: 'Não foi possivel remover o projeto.', classes: 'rounded' });
    });
  }

}
