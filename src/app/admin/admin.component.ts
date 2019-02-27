import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Projeto } from '../models/projeto.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AngularFireStorage } from 'angularfire2/storage';
import * as firebase from 'firebase';

declare var $: any;
declare var M: any;

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [AngularFirestore, Projeto]
})
export class AdminComponent implements OnInit {

  //Checar se o projeto fica sem qualquer imagem ao editar
  check = false;
  selectedFiles: FileList;
  file: File;
  findOneId: any = {
    id: '',
    titulo: '',
    status: '',
    finalidade: '',
    financiamento: '',
    area: '',
    equipe: { coordenador: { nome: '', telefone: '', email: '' }, membros: '' },
    aplicabilidade: { contexto: '' }
  };
  projetos: Observable<Projeto[]>;
  projeto: Projeto = new Projeto();
  //Guarda título antigo p/ excluir file ao editar projeto
  tituloAntigo: any;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.projeto.coordenador = { nome: '', email: '', telefone: '' };
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

  //Capturando imagem selecionada
  chooseFiles(event) {
    this.selectedFiles = event.target.files;
  }

  //Upload da imagem selecionada para o Firebase Storage
  uploadpic() {
    var that = this;
    let file = this.selectedFiles.item(0);
    this.storage.upload('/imagens/projeto-' + that.projeto.titulo, file).then(function (snapshot) {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        that.projeto.img = downloadURL;
      }).then(function () {
        that.createProjetoImg();
      })
    })
  }

  //Upload da imagem selecionada para o Firebase Storage quando editar o projeto
  uploadpicEdit() {
    var that = this;
    let file = this.selectedFiles.item(0);
    this.storage.upload('/imagens/projeto-' + that.findOneId.titulo, file).then(function (snapshot) {
      snapshot.ref.getDownloadURL().then(downloadURL => {
        that.findOneId.img = downloadURL;
      }).then(function () {
        that.createProjetoImg();
      })
    })
  }

  //Criar projeto sem img
  createProjeto() {
    if (this.projeto.financiamento == (undefined || null || ''))
      this.projeto.financiamento = 'Auto-Financiado'
    var splitMembros = this.projeto.membros.split(',');
    var splitContratacao = this.projeto.modalidade.split(',');
    var splitContexto = this.projeto.contexto.split(',');

    // Show full page LoadingOverlay
    $.LoadingOverlay("show");

    if (this.selectedFiles == (null || undefined)) {
      this.db.collection("projetos").add({
        titulo: this.projeto.titulo,
        status: this.projeto.status,
        finalidade: this.projeto.finalidade,
        financiamento: this.projeto.financiamento,
        area: this.projeto.area,
        equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
        aplicabilidade: { contexto: splitContexto, quesitos: this.projeto.quesitos, modalidade: splitContratacao },
      })
        .then(function (docRef) {
          $('#create').modal('close');
          M.toast({ html: 'Projeto criado com sucesso!', classes: 'rounded' });
          $.LoadingOverlay("hide");
          (document.getElementById('myForm') as HTMLFormElement).reset();
        })
        .catch(function (error) {
          M.toast({ html: 'Não foi possível criar o projeto', classes: 'rounded' });
          $.LoadingOverlay("hide");
        });
    } else {
      this.uploadpic();
    }

  }

  //Criar projeto com img
  createProjetoImg() {
    var splitMembros = this.projeto.membros.split(',');
    var splitContratacao = this.projeto.modalidade.split(',');
    var splitContexto = this.projeto.contexto.split(',');

    this.db.collection("projetos").add({
      titulo: this.projeto.titulo,
      status: this.projeto.status,
      finalidade: this.projeto.finalidade,
      financiamento: this.projeto.financiamento,
      area: this.projeto.area,
      equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
      aplicabilidade: { contexto: splitContexto, quesitos: this.projeto.quesitos, modalidade: splitContratacao },
      imgUrl: this.projeto.img
    })
      .then(function (docRef) {
        $('#create').modal('close');
        M.toast({ html: 'Projeto criado com sucesso!', classes: 'rounded' });
        $.LoadingOverlay("hide");
        (document.getElementById('myForm') as HTMLFormElement).reset();
      })
      .catch(function (error) {
        M.toast({ html: 'Não foi possível criar o projeto', classes: 'rounded' });
        $.LoadingOverlay("hide");
      });

  }

  findOne(string, quem) {
    $("#" + quem).LoadingOverlay("show");
    var docRef = this.db.collection("projetos").doc(string);

    docRef.ref.
      get().then(documentSnapshot => {
        if (documentSnapshot.exists) {
          this.findOneId = documentSnapshot.data();
          this.tituloAntigo = documentSnapshot.data().titulo;
          this.findOneId.id = documentSnapshot.id;
          console.log("Document data:", documentSnapshot.data());
          $("#" + quem).LoadingOverlay("hide", true);
        } else {
          // doc.data() will be undefined in this case
          console.log("No such document!");
        }
      });
  }

  deletarProjeto(string, titulo) {
    var that = this;
    this.db.collection("projetos").doc(string).delete().then(function () {
      $('#delete').modal('close');
      M.toast({ html: 'Projeto deletado com sucesso!', classes: 'rounded' });
      // Delete the file
      that.storage.ref('/imagens/').child('projeto-' + titulo).delete();
    }).catch(function (error) {
      console.log(error);
      M.toast({ html: 'Não foi possivel remover o projeto.', classes: 'rounded' });
    });
  }

  editarProjeto(string) {
    var splitMembros = this.projeto.membros.split(',');
    var splitContratacao = this.projeto.modalidade.split(',');
    var splitContexto = this.projeto.contexto.split(',');

    $.LoadingOverlay("show");
    var url;
    var that = this;
    var docRef = this.db.collection("projetos").doc(string);

    if (this.check) {
      // Delete the file
      this.storage.ref('/imagens/').child('projeto-' + this.tituloAntigo).delete();
      return docRef.update({
        titulo: this.findOneId.titulo,
        status: this.findOneId.status,
        finalidade: this.findOneId.finalidade,
        financiamento: this.findOneId.financiamento,
        area: this.findOneId.area,
        equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
        aplicabilidade: {
          contexto: splitContexto,
          quesitos: this.findOneId.aplicabilidade.quesitos,
          modalidade: splitContratacao
        },
        imgUrl: firebase.firestore.FieldValue.delete()
      })
        .then(function () {
          $('#edit').modal('close');
          M.toast({ html: 'Projeto editado com sucesso!', classes: 'rounded' });
          $.LoadingOverlay("hide");
        })
        .catch(function (error) {
          M.toast({ html: 'Não foi possivel editar o projeto.', classes: 'rounded' });
          $.LoadingOverlay("hide");
        });
    } else {
      if (this.findOneId.imgUrl == (null || undefined)) {
        if (this.selectedFiles == (null || undefined)) {
          return docRef.update({
            titulo: this.findOneId.titulo,
            status: this.findOneId.status,
            finalidade: this.findOneId.finalidade,
            financiamento: this.findOneId.financiamento,
            area: this.findOneId.area,
            equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
            aplicabilidade: {
              contexto: splitContexto,
              quesitos: this.findOneId.aplicabilidade.quesitos,
              modalidade: splitContratacao
            },
          })
            .then(function () {
              $('#edit').modal('close');
              M.toast({ html: 'Projeto editado com sucesso!', classes: 'rounded' });
              $.LoadingOverlay("hide");
            })
            .catch(function (error) {
              M.toast({ html: 'Não foi possivel editar o projeto.', classes: 'rounded' });
              $.LoadingOverlay("hide");
            });
        } else {

          this.storage.upload('/imagens/projeto-' + this.findOneId.titulo, this.selectedFiles.item(0)).then(function (snapshot) {
            snapshot.ref.getDownloadURL().then(downloadURL => {
              url = downloadURL;
            }).then(function () {
              return docRef.update({
                titulo: that.findOneId.titulo,
                status: that.findOneId.status,
                finalidade: that.findOneId.finalidade,
                financiamento: that.findOneId.financiamento,
                area: that.findOneId.area,
                equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
                aplicabilidade: {
                  contexto: splitContexto,
                  quesitos: this.findOneId.aplicabilidade.quesitos,
                  modalidade: splitContratacao
                },
                imgUrl: url
              })
                .then(function () {
                  $('#edit').modal('close');
                  M.toast({ html: 'Projeto editado com sucesso!', classes: 'rounded' });
                  $.LoadingOverlay("hide");
                })
                .catch(function (error) {
                  M.toast({ html: 'Não foi possivel editar o projeto.', classes: 'rounded' });
                  $.LoadingOverlay("hide");
                });
            })
          })
        }
      } else {
        if (this.selectedFiles != (null || undefined)) {

          // Delete the file
          this.storage.ref('/imagens/').child('projeto-' + this.tituloAntigo).delete();
          this.storage.upload('/imagens/projeto-' + this.findOneId.titulo, this.selectedFiles.item(0)).then(function (snapshot) {
            snapshot.ref.getDownloadURL().then(downloadURL => {
              url = downloadURL;
            }).then(function () {
              return docRef.update({
                titulo: that.findOneId.titulo,
                status: that.findOneId.status,
                finalidade: that.findOneId.finalidade,
                financiamento: that.findOneId.financiamento,
                area: that.findOneId.area,
                equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
                aplicabilidade: {
                  contexto: splitContexto,
                  quesitos: this.findOneId.aplicabilidade.quesitos,
                  modalidade: splitContratacao
                },
                imgUrl: url
              })
                .then(function () {
                  $('#edit').modal('close');
                  M.toast({ html: 'Projeto editado com sucesso!', classes: 'rounded' });
                  $.LoadingOverlay("hide");
                })
                .catch(function (error) {
                  M.toast({ html: 'Não foi possivel editar o projeto.', classes: 'rounded' });
                  $.LoadingOverlay("hide");
                });
            })
          })

        } else {
          return docRef.update({
            titulo: this.findOneId.titulo,
            status: this.findOneId.status,
            finalidade: this.findOneId.finalidade,
            financiamento: this.findOneId.financiamento,
            area: this.findOneId.area,
            equipe: { coordenador: this.projeto.coordenador, membros: splitMembros },
            aplicabilidade: {
              contexto: splitContexto,
              quesitos: this.findOneId.aplicabilidade.quesitos,
              modalidade: splitContratacao
            },
            imgUrl: this.findOneId.imgUrl
          })
            .then(function () {
              $('#edit').modal('close');
              M.toast({ html: 'Projeto editado com sucesso!', classes: 'rounded' });
              $.LoadingOverlay("hide");
            })
            .catch(function (error) {
              M.toast({ html: 'Não foi possivel editar o projeto.', classes: 'rounded' });
              $.LoadingOverlay("hide");
            });
        }
      }

    }
  }

}
