import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Observable, from } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private afAuth: AngularFireAuth) {}

  /**
   * Register a new user with email and password.
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the registration result
   */
  register(email: string, password: string): Observable<any> {
    return from(this.afAuth.createUserWithEmailAndPassword(email, password)).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        throw error;
      })
    );
  }

  /**
   * Log in an existing user with email and password.
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the login result
   */
  login(email: string, password: string): Observable<any> {
    return from(this.afAuth.signInWithEmailAndPassword(email, password)).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  /**
   * Log out the currently logged-in user.
   * @returns Observable of the logout result
   */
  logout(): Observable<void> {
    return from(this.afAuth.signOut()).pipe(
      catchError((error) => {
        console.error('Logout error:', error);
        throw error;
      })
    );
  }

  /**
   * Get the currently authenticated user as an observable.
   * @returns Observable of the current user's authentication state
   */
  getCurrentUser(): Observable<any> {
    return this.afAuth.authState;
  }

  /**
   * Wrapper for registering a user (used for consistency with other methods).
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the registration result
   */
  registerUser(email: string, password: string): Observable<any> {
    return this.register(email, password);
  }

  /**
   * Wrapper for logging in a user (used for consistency with other methods).
   * @param email User's email address
   * @param password User's password
   * @returns Observable of the login result
   */
  loginUser(email: string, password: string): Observable<any> {
    return this.login(email, password);
  }
}