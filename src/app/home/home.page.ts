import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class HomePage {
  email: string = '';
  password: string = '';
  isLogin: boolean = true;

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private router: Router // ✅ Inject Router
  ) {}

  async presentToast(message: string, color: string = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'top',
      color
    });
    toast.present();
  }

  login() {
    this.authService.login(this.email, this.password).subscribe(
      () => {
        this.presentToast('You have successfully logged in!');
        this.router.navigate(['/dashboard']); // ✅ Navigate after login
      },
      (error) => {
        console.error(error);
        this.presentToast('Login failed. Please try again.', 'danger');
      }
    );
  }

  register() {
    this.authService.register(this.email, this.password).subscribe(
      () => {
        this.presentToast('You have successfully registered!');
        this.isLogin = true; // ✅ Switch to login form after registration
      },
      (error) => {
        console.error(error);
        this.presentToast('Registration failed. Please try again.', 'danger');
      }
    );
  }
}