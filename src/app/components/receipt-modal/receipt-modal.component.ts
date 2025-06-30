import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receipt-modal',
  templateUrl: './receipt-modal.component.html',
  styleUrls: ['./receipt-modal.component.scss'],
  standalone: false
})
export class ReceiptModalComponent {
  @Input() transaction: any;

  constructor(private modalCtrl: ModalController, private router: Router) {}

  close() {
    this.modalCtrl.dismiss().then(() => {
      // Navigate to the transaction page after closing the modal
      this.router.navigate(['/transaction']);
    });
  }

  printReceipt() {
    window.print();
  }
}