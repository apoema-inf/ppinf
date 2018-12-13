import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { map } from "rxjs/operators";
import * as firebase from 'firebase/app';

@Injectable()
export class AuthService {

  constructor(
    public afAuth: AngularFireAuth
  ) { }

  loginEmail(email: string, pass: string) {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
      .then(function () {
        // Existing and future Auth states are now persisted in the current
        // session only. Closing the window would clear any existing state even
        // if a user forgets to sign out.
        // ...
        // New sign-in will be persisted with session persistence.
        return firebase.auth().signInWithEmailAndPassword(email, pass);
      })
      .catch(function (error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
      });
    return new Promise((resolve, reject) => {
      this.afAuth.auth.signInWithEmailAndPassword(email, pass)
        .then(userData => resolve(userData),
          err => reject(err));
    });
  }

  getAuth() {
    return this.afAuth.authState.pipe(map(auth => auth));
  }

  logout() {
    return this.afAuth.auth.signOut();
  }

}