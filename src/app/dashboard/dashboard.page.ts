import { Component, OnInit } from '@angular/core';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { AuthService } from '../auth.service';
import { ReceiptModalComponent } from '../components/receipt-modal/receipt-modal.component';
import { Router } from '@angular/router';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {
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

  showAddProductModal = false;
  newProductName = '';
  newProductPrice: number = 0;
  newProductCategory: string = 'vegetables';
  newProductQuantity: number = 0;
  newProductUnit: string = 'kg';

  showEditProductModal = false;
  editProductId: string = '';
  editProductName = '';
  editProductPrice: number = 0;
  editProductCategory: string = 'vegetables';
  editProductQuantity: number = 0;
  editProductUnit: string = 'kg';

  products: any[] = [];
  filteredProducts: any[] = [];
  transactionHistory: any[] = [];

  paymentMethods = [
    { id: 'cash', name: 'Cash', icon: 'cash-outline' },
    { id: 'credit_card', name: 'Credit Card', icon: 'card-outline' },
    { id: 'gcash', name: 'GCash', icon: 'phone-portrait-outline' },
    { id: 'paymaya', name: 'PayMaya', icon: 'wallet-outline' }
  ];

  summaryCards = [
    { title: 'Available Products', value: 0, icon: 'cube-outline', color: 'primary' },
    { title: 'Special Offers', value: 3, icon: 'pricetag-outline', color: 'warning' },
    { title: 'Fresh Vegetables', value: 0, icon: 'leaf-outline', color: 'success' },
    { title: 'Quality Meats', value: 0, icon: 'nutrition-outline', color: 'danger' }
  ];

  constructor(
    private authService: AuthService,
    private toastController: ToastController,
    private modalCtrl: ModalController,
    private router: Router,
    private firestoreService: FirestoreService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.loadUserName();
    this.loadProducts();

    setTimeout(() => {
      this.showWelcome = false;
    }, 5000);
  }

  private loadUserName() {
    this.authService.getCurrentUser().subscribe((user) => {
      this.userName = user?.displayName || user?.email || 'Guest';
    });
  }

  loadProducts() {
    this.firestoreService.getProducts().subscribe(products => {
      console.log('Products loaded from Firestore:', products);
      this.products = products;
      // Apply current search and segment filters
      this.onSearchChange({ target: { value: this.searchQuery } });
      this.updateSummaryCards();
      console.log('Filtered products:', this.filteredProducts);
      console.log('Active segment:', this.activeSegment);
    });
  }

  openAddProductModal() {
    this.showAddProductModal = true;
  }

  closeAddProductModal() {
    this.showAddProductModal = false;
    this.newProductName = '';
    this.newProductPrice = 0;
    this.newProductCategory = 'vegetables';
    this.newProductQuantity = 0;
    this.newProductUnit = 'kg';
  }

  private async saveProductToFirestore(product: any): Promise<any> {
    return this.firestoreService.addProduct(product);
  }

  addProduct() {
    if (this.newProductName && this.newProductPrice != null && this.newProductCategory && this.newProductQuantity != null && this.newProductUnit) {
      const newProduct = {
        name: this.newProductName,
        price: this.newProductPrice,
        unit: this.newProductUnit,
        quantity: this.newProductQuantity,
        threshold: 10,
        image: 'https://via.placeholder.com/150',
        category: this.newProductCategory,
        createdAt: new Date()
      };

      // Use setTimeout to ensure the method runs in the next tick with proper injection context
      setTimeout(async () => {
        try {
          await this.saveProductToFirestore(newProduct);
          this.presentToast('Product added successfully', 'success');
          this.closeAddProductModal();
          // The real-time subscription in loadProducts() will automatically update the arrays
        } catch (error) {
          console.error('Error adding product to Firestore:', error);
          this.presentToast('Failed to add product', 'danger');
        }
      }, 0);
    } else {
      this.presentToast('Please fill all fields', 'warning');
    }
  }

  editProduct(product: any) {
    this.editProductId = product.id;
    this.editProductName = product.name;
    this.editProductPrice = product.price;
    this.editProductQuantity = product.quantity;
    this.editProductUnit = product.unit;
    this.editProductCategory = product.category;
    this.showEditProductModal = true;
  }

  closeEditProductModal() {
    this.showEditProductModal = false;
    this.editProductId = '';
    this.editProductName = '';
    this.editProductPrice = 0;
    this.editProductQuantity = 0;
    this.editProductUnit = 'kg';
    this.editProductCategory = 'vegetables';
  }

  updateProduct() {
    if (this.editProductName && this.editProductPrice != null && this.editProductCategory &&
        this.editProductQuantity != null && this.editProductUnit && this.editProductId) {

      const updatedProduct = {
        name: this.editProductName,
        price: this.editProductPrice,
        unit: this.editProductUnit,
        quantity: this.editProductQuantity,
        category: this.editProductCategory,
        threshold: 10,
        image: 'https://via.placeholder.com/150',
        updatedAt: new Date()
      };

      setTimeout(async () => {
        try {
          await this.firestoreService.updateProduct(this.editProductId, updatedProduct);
          this.presentToast('Product updated successfully', 'success');
          this.closeEditProductModal();
        } catch (error) {
          console.error('Error updating product:', error);
          this.presentToast('Failed to update product', 'danger');
        }
      }, 0);
    } else {
      this.presentToast('Please fill all fields', 'warning');
    }
  }

  async deleteProduct(product: any) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${product.name}"?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
            try {
              await this.firestoreService.deleteProduct(product.id);
              this.presentToast('Product deleted successfully', 'success');
            } catch (error) {
              console.error('Error deleting product:', error);
              this.presentToast('Failed to delete product', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  isItemSelected(item: any): boolean {
    return this.selectedItems.some(selected => selected.id === item.id);
  }

  viewProduct(product: any) {
    this.presentToast(`Viewing ${product.name} details`, 'primary');
  }

  toggleItemSelection(item: any) {
    const index = this.selectedItems.findIndex(i => i.id === item.id);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
      item.selectedQuantity = 0;
    } else {
      this.selectedItems.push({ ...item, selectedQuantity: 1 });
    }
  }

  updateQuantity(item: any, change: number) {
    const selectedItem = this.selectedItems.find(i => i.id === item.id);
    if (selectedItem) {
      selectedItem.selectedQuantity += change;
      selectedItem.selectedQuantity = Math.max(0, Math.min(selectedItem.selectedQuantity, item.quantity));
      if (selectedItem.selectedQuantity <= 0) {
        this.toggleItemSelection(item);
      }
    }
  }

  getSelectedItemQuantity(item: any): number {
    const selectedItem = this.selectedItems.find(i => i.id === item.id);
    return selectedItem ? selectedItem.selectedQuantity : 0;
  }

  openCart() {
    if (this.selectedItems.length === 0) {
      this.presentToast('Your cart is empty', 'warning');
      return;
    }
    this.openPaymentModal();
  }

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
      await new Promise(resolve => setTimeout(resolve, 1000));

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

      await this.firestoreService.addTransaction(transaction);

      this.selectedItems.forEach(selected => {
        const product = this.products.find(p => p.id === selected.id);
        if (product) {
          product.quantity -= selected.selectedQuantity;
        }
      });

      this.transactionHistory.unshift(transaction);
      this.presentToast(`Payment of ${this.formatPrice(this.paymentAmount)} successful`, 'success');
      await this.showReceipt(transaction);
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
      componentProps: { transaction },
      cssClass: 'receipt-modal'
    });
    await modal.present();
  }

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
    let result;
    if (this.activeSegment === 'vegetables') {
      result = [{ name: 'Fresh Vegetables', items: this.filteredProducts.filter(p => p.category === 'vegetables') }];
    } else if (this.activeSegment === 'meats') {
      result = [{ name: 'Quality Meats', items: this.filteredProducts.filter(p => p.category === 'meats') }];
    } else {
      result = [
        { name: 'Fresh Vegetables', items: this.filteredProducts.filter(p => p.category === 'vegetables') },
        { name: 'Quality Meats', items: this.filteredProducts.filter(p => p.category === 'meats') }
      ];
    }
    console.log('Filtered categories:', result);
    return result;
  }

  private updateSummaryCards() {
    const vegetables = this.products.filter(p => p.category === 'vegetables');
    const meats = this.products.filter(p => p.category === 'meats');

    this.summaryCards = [
      { title: 'Available Products', value: this.products.length, icon: 'cube-outline', color: 'primary' },
      { title: 'Special Offers', value: 3, icon: 'pricetag-outline', color: 'warning' },
      { title: 'Fresh Vegetables', value: vegetables.length, icon: 'leaf-outline', color: 'success' },
      { title: 'Quality Meats', value: meats.length, icon: 'nutrition-outline', color: 'danger' }
    ];
  }

  getSelectedTotalPrice(): number {
    return this.selectedItems.reduce((total, item) => total + (item.selectedQuantity * item.price), 0);
  }

  getSelectedTotalQuantity(): number {
    return this.selectedItems.reduce((total, item) => total + item.selectedQuantity, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 2 }).format(price);
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
}
