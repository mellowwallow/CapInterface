import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private db: any;

  constructor() {
    // Initialize Firebase app and Firestore
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }

  // Get all products
  getProducts(): Observable<any[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(collection(this.db, 'products'), (snapshot) => {
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(products);
      }, (error) => {
        observer.error(error);
      });

      // Return cleanup function
      return () => unsubscribe();
    });
  }

  // Add a new product
  async addProduct(product: any): Promise<any> {
    try {
      const docRef = await addDoc(collection(this.db, 'products'), product);
      return docRef;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Add a transaction
  async addTransaction(transaction: any): Promise<any> {
    try {
      const docRef = await addDoc(collection(this.db, 'transactions'), transaction);
      return docRef;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Update a product
  async updateProduct(productId: string, updatedData: any): Promise<void> {
    try {
      const productRef = doc(this.db, 'products', productId);
      await updateDoc(productRef, updatedData);
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(productId: string): Promise<void> {
    try {
      const productRef = doc(this.db, 'products', productId);
      await deleteDoc(productRef);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}
