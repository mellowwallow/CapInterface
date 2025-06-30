import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private firestore: AngularFirestore) {}

  addProduct(product: any): Promise<any> {
    return this.firestore.collection('products').add(product);
  }

  getProducts(): Observable<any[]> {
    return this.firestore.collection('products').valueChanges({ idField: 'id' });
  }

  // Add update and delete methods as needed
}
