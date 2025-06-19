import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ToastController, ModalController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { ReceiptModalComponent } from '../components/receipt-modal/receipt-modal.component';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class DashboardPage {
   showWelcome = true;
  userName: string = 'Guest';
  activeSegment = 'all';
  searchQuery: string = '';
  selectedItems: any[] = [];
  paymentProcessing: boolean = false;
  showPaymentModal: boolean = false;
  paymentAmount: number = 0;
  paymentChange: number = 0;
  selectedPaymentMethod: string = 'cash';

  // Customer Data
  paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'cash-outline' },
    { id: 'credit_card', name: 'Credit Card', icon: 'card-outline' },
    { id: 'gcash', name: 'GCash', icon: 'phone-portrait-outline' },
    { id: 'paymaya', name: 'PayMaya', icon: 'wallet-outline' }
  ];
  
  summaryCards = [
    {
      title: 'Available Products',
      value: 0,
      icon: 'cube-outline',
      color: 'primary'
    },
    {
      title: 'Special Offers',
      value: 3,
      icon: 'pricetag-outline',
      color: 'warning'
    },
    {
      title: 'Fresh Vegetables',
      value: 0,
      icon: 'leaf-outline',
      color: 'success'
    },
    {
      title: 'Quality Meats',
      value: 0,
      icon: 'nutrition-outline',
      color: 'danger'
    }
  ];

  // Product Data
  products = [
    { 
      id: 1,
      name: 'Organic Carrots', 
      manufactureDate: new Date('2023-10-15'), 
      quantity: 50, 
      price: 25.50, 
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979', 
      category: 'vegetables', 
      threshold: 10,
      unit: 'kg',
      selectedQuantity: 0
    },
    { 
      id: 2,
      name: 'Fresh Tomatoes', 
      manufactureDate: new Date('2023-10-16'), 
      quantity: 30, 
      price: 35.75, 
      image: 'https://images.unsplash.com/photo-1592841200221-a6895f5f0a0e', 
      category: 'vegetables', 
      threshold: 15,
      unit: 'kg',
      selectedQuantity: 0
    },
    { 
      id: 3,
      name: 'Premium Chicken Breast', 
      manufactureDate: new Date('2023-10-14'), 
      quantity: 20, 
      price: 120.75, 
      image: 'https://5.imimg.com/data5/RF/TQ/MY-11305339/raw-boneless-chicken-breasts-1000x1000.jpg', 
      category: 'meats',
      threshold: 5,
      unit: 'kg',
      selectedQuantity: 0
    },
    { 
      id: 4,
      name: 'Grass-fed Beef', 
      manufactureDate: new Date('2023-10-13'), 
      quantity: 15, 
      price: 180.50, 
      image: 'https://images.unsplash.com/photo-1558030136-1c1e6b0e8b0a', 
      category: 'meats',
      threshold: 5,
      unit: 'kg',
      selectedQuantity: 0
    }
  ];

  filteredProducts: any[] = [...this.products];
  transactionHistory: any[] = [];

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private router: Router,
    private firestore: AngularFirestore
  ) {
    this.loadUserName();
    this.updateSummaryCards();
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.some(selected => selected.id === item.id);
  }

  private loadUserName() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.userName = user?.displayName || user?.email || 'Guest';
    });
  }

  // Customer Methods
  openCart() {
    if (this.selectedItems.length === 0) {
      this.presentToast('Your cart is empty', 'warning');
      return;
    }
    this.openPaymentModal();
  }

  viewProduct(product: any) {
    // In a real app, you might navigate to a product detail page
    console.log('Viewing product:', product.name);
    this.presentToast(`Viewing ${product.name} details`, 'primary');
  }

  toggleItemSelection(item: any) {
    const index = this.selectedItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
      item.selectedQuantity = 0;
    } else {
      this.selectedItems.push({...item, selectedQuantity: 1});
    }
  }

  updateQuantity(item: any, change: number) {
    const selectedItem = this.selectedItems.find(i => i.id === item.id);
    if (selectedItem) {
      selectedItem.selectedQuantity += change;
      
      // Ensure quantity doesn't go below 0 or above available stock
      selectedItem.selectedQuantity = Math.max(0, 
        Math.min(selectedItem.selectedQuantity, item.quantity));
      
      // Remove if quantity is 0
      if (selectedItem.selectedQuantity <= 0) {
        this.toggleItemSelection(item);
      }
    }
  }

  getSelectedItemQuantity(item: any): number {
    const selectedItem = this.selectedItems.find(i => i.id === item.id);
    return selectedItem ? selectedItem.selectedQuantity : 0;
  }

  // Payment Methods
  openPaymentModal() {
    if (this.selectedItems.length === 0) {
      this.presentToast('Please add items to your cart first', 'warning');
      return;
    }
    this.paymentAmount = this.getSelectedTotalPrice();
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
    this.paymentAmount = 0;
    this.paymentChange = 0;
  }

  calculatePaymentChange() {
    const total = this.getSelectedTotalPrice();
    this.paymentChange = this.paymentAmount - total;
    return this.paymentChange;
  }

  async confirmPayment() {
    if (this.paymentAmount < this.getSelectedTotalPrice()) {
      this.presentToast('Payment amount is insufficient', 'warning');
      return;
    }

    this.paymentProcessing = true;
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create transaction record
      const transaction = {
        id: Date.now(),
        date: new Date(),
        items: this.selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.selectedQuantity,
          price: item.price,
          total: item.selectedQuantity * item.price
        })),
        paymentMethod: this.selectedPaymentMethod,
        amountPaid: this.paymentAmount,
        change: this.paymentChange,
        total: this.getSelectedTotalPrice(),
        customerName: this.userName
      };
      
      // In a real app, you would save to Firestore here
      // await this.firestore.collection('transactions').add(transaction);
      
      // Update inventory (in a real app, this would be server-side)
      this.selectedItems.forEach(selected => {
        const product = this.products.find(p => p.id === selected.id);
        if (product) {
          product.quantity -= selected.selectedQuantity;
        }
      });
      
      this.transactionHistory.unshift(transaction);
      this.presentToast(`Payment of ${this.formatPrice(this.paymentAmount)} successful`, 'success');
      
      // Show receipt
      await this.showReceipt(transaction);
      
      // Clear selection
      this.selectedItems = [];
      this.showPaymentModal = false;
      this.updateSummaryCards();
    } catch (error) {
      this.presentToast('Payment processing failed', 'danger');
      console.error(error);
    } finally {
      this.paymentProcessing = false;
    }
  }

  async showReceipt(transaction: any) {
    const modal = await this.modalCtrl.create({
      component: ReceiptModalComponent,
      componentProps: {
        transaction: transaction
      },
      cssClass: 'receipt-modal'
    });
    await modal.present();
  }

  // Search and Filter
  onSearchChange(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter(item => 
      item.name.toLowerCase().includes(query) &&
      (this.activeSegment === 'all' || item.category === this.activeSegment)
    );
  }

  segmentChanged(ev: any) {
    this.activeSegment = ev.detail.value;
    this.onSearchChange({ target: { value: this.searchQuery } });
    this.updateSummaryCards();
  }

  get filteredCategories() {
    if (this.activeSegment === 'vegetables') {
      return [{ name: 'Fresh Vegetables', items: this.filteredProducts.filter(p => p.category === 'vegetables') }];
    } else if (this.activeSegment === 'meats') {
      return [{ name: 'Quality Meats', items: this.filteredProducts.filter(p => p.category === 'meats') }];
    }
    return [
      { name: 'Fresh Vegetables', items: this.filteredProducts.filter(p => p.category === 'vegetables') },
      { name: 'Quality Meats', items: this.filteredProducts.filter(p => p.category === 'meats') }
    ];
  }

  // Helper Methods
  private updateSummaryCards() {
    const vegetables = this.products.filter(p => p.category === 'vegetables');
    const meats = this.products.filter(p => p.category === 'meats');
    
    this.summaryCards = [
      {
        title: 'Available Products',
        value: this.products.length,
        icon: 'cube-outline',
        color: 'primary'
      },
      {
        title: 'Special Offers',
        value: 3, // Hardcoded for demo
        icon: 'pricetag-outline',
        color: 'warning'
      },
      {
        title: 'Fresh Vegetables',
        value: vegetables.length,
        icon: 'leaf-outline',
        color: 'success'
      },
      {
        title: 'Quality Meats',
        value: meats.length,
        icon: 'nutrition-outline',
        color: 'danger'
      }
    ];
  }

  getSelectedTotalPrice(): number {
    return this.selectedItems.reduce((total, item) => {
      return total + (item.selectedQuantity * item.price);
    }, 0);
  }

  getSelectedTotalQuantity(): number {
    return this.selectedItems.reduce((total, item) => total + item.selectedQuantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2
    }).format(price);
  }

  async presentToast(message: string, color: 'primary' | 'success' | 'warning' | 'danger' = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.presentToast('Logged out successfully', 'success');
      this.router.navigate(['/login']);
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.showWelcome = false;
    }, 5000); // 5 seconds
  }

}