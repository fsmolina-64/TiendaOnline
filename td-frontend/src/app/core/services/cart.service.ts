import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Cart } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CartService {
  cartCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getCart() {
    return this.http.get<Cart>(`${API}/cart`).pipe(
      tap((cart) => this.cartCount.set(cart.items.length)),
    );
  }

  addItem(productId: string, quantity: number) {
    return this.http.post(`${API}/cart/${productId}`, { quantity }).pipe(
      tap(() => this.cartCount.update((c) => c + 1)),
    );
  }

  updateItem(productId: string, quantity: number) {
    return this.http.patch(`${API}/cart/${productId}`, { quantity });
  }

  removeItem(productId: string) {
    return this.http.delete(`${API}/cart/${productId}`).pipe(
      tap(() => this.cartCount.update((c) => Math.max(0, c - 1))),
    );
  }

  clearCart() {
    return this.http.delete(`${API}/cart/clear`).pipe(
      tap(() => this.cartCount.set(0)),
    );
  }
}