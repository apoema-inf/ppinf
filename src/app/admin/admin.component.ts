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
  findOneId: Projeto = new Projeto();
  projetos: Observable<Projeto[]>;
  projeto: Projeto = new Projeto();
  //Guarda título antigo p/ excluir file ao editar projeto
  tituloAntigo: any;

  constructor(private db: AngularFirestore, private storage: AngularFireStorage) {
    this.initProjeto();
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

  private initProjeto() {
    this.projeto.url = '';
    this.projeto.titulo = '';
    this.projeto.descricao = '';
    this.projeto.categorizacao = {
      area: '',
      status: '',
      coordenador: {
        nome: '', telefone: '', email: ''
      },
      finalidade: '',
      financiamento: 'Auto-Financiado',
      membros: [],
    }
    this.projeto.contexto = {
      contexto: [],
      quesitos: '',
      contratacao: [],
    }

    //findOneID init
    this.findOneId.url = '';
    this.findOneId.titulo = '';
    this.findOneId.descricao = '';
    this.findOneId.categorizacao = {
      area: '',
      status: '',
      coordenador: {
        nome: '', telefone: '', email: ''
      },
      finalidade: '',
      financiamento: 'Auto-Financiado',
      membros: [],
    }
    this.findOneId.contexto = {
      contexto: [],
      quesitos: '',
      contratacao: [],
    }
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
    this.splitArrays();

    // Show full page LoadingOverlay
    $.LoadingOverlay("show");

    if (this.selectedFiles == (null || undefined)) {
      this.db.collection("projetos").add({
        titulo: this.projeto.titulo,
        url: this.projeto.url,
        descricao: this.projeto.descricao,
        categorizacao: this.projeto.categorizacao,
        contexto: this.projeto.contexto,
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

  private splitArrays() {
    if (this.projeto.categorizacao.membros && this.projeto.categorizacao.membros.length > 0) {
      this.projeto.categorizacao.membros = this.projeto.categorizacao.membros.split(',');
    }
    else {
      this.projeto.categorizacao.membros = '';
    }
    if (this.projeto.contexto.contratacao && this.projeto.contexto.contratacao.length > 0) {
      this.projeto.contexto.contratacao = this.projeto.contexto.contratacao.split(',');
    }
    else {
      this.projeto.contexto.contratacao = '';
    }
    if (this.projeto.contexto.contexto && this.projeto.contexto.contexto.length > 0) {
      this.projeto.contexto.contexto = this.projeto.contexto.contexto.split(',');
    }
    else {
      this.projeto.contexto.contexto = '';
    }
  }

  //Criar projeto com img
  createProjetoImg() {
    this.splitArrays();

    this.db.collection("projetos").add({
      titulo: this.projeto.titulo,
      url: this.projeto.url,
      descricao: this.projeto.descricao,
      categorizacao: this.projeto.categorizacao,
      contexto: this.projeto.contexto,
      img: this.projeto.img
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

  findOne(string, janela) {
    $("#" + janela).LoadingOverlay("show");
    var docRef = this.db.collection("projetos").doc(string);

    docRef.ref.
      get().then(documentSnapshot => {
        if (documentSnapshot.exists) {
          this.findOneId = documentSnapshot.data() as Projeto;
          console.log(this.findOneId);
          this.tituloAntigo = documentSnapshot.data().titulo;
          this.findOneId.id = documentSnapshot.id;
          $("#" + janela).LoadingOverlay("hide", true);
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
      M.toast({ html: 'Não foi possivel remover o projeto.', classes: 'rounded' });
    });
  }

  editarProjeto(string) {

    $.LoadingOverlay("show");
    var url;
    var that = this;
    var docRef = this.db.collection("projetos").doc(string);

    if (this.check) {
      // Delete the file
      this.storage.ref('/imagens/').child('projeto-' + this.tituloAntigo).delete();
      return docRef.update({
        titulo: this.findOneId.titulo,
        url: this.findOneId.url,
        descricao: this.findOneId.descricao,
        categorizacao: this.findOneId.categorizacao,
        contexto: this.findOneId.contexto,
        img: firebase.firestore.FieldValue.delete()
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
      if (this.findOneId.img == (null || undefined)) {
        if (this.selectedFiles == (null || undefined)) {
          return docRef.update({
            titulo: this.findOneId.titulo,
            url: this.findOneId.url,
            descricao: this.findOneId.descricao,
            categorizacao: this.findOneId.categorizacao,
            contexto: this.findOneId.contexto,
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
                url: that.findOneId.url,
                descricao: that.findOneId.descricao,
                categorizacao: that.findOneId.categorizacao,
                contexto: that.findOneId.contexto,
                img: url
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
                url: that.findOneId.url,
                descricao: that.findOneId.descricao,
                categorizacao: that.findOneId.categorizacao,
                contexto: that.findOneId.contexto,
                img: url
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
            url: this.findOneId.url,
            descricao: this.findOneId.descricao,
            categorizacao: this.findOneId.categorizacao,
            contexto: this.findOneId.contexto,
            img: this.findOneId.img
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