import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Cart } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly api = environment.apiUrl;
  cartCount = signal<number>(0);

  constructor(private http: HttpClient) {}

  getCart() {
    return this.http.get<Cart>(`${this.api}/cart`).pipe(
      tap((cart) => this.cartCount.set(cart.items.length)),
    );
  }

  addItem(productId: string, quantity: number) {
    return this.http.post(`${this.api}/cart/${productId}`, { quantity }).pipe(
      tap(() => this.cartCount.update((c) => c + 1)),
    );
  }

  updateItem(productId: string, quantity: number) {
    return this.http.patch(`${this.api}/cart/${productId}`, { quantity });
  }

  removeItem(productId: string) {
    return this.http.delete(`${this.api}/cart/${productId}`).pipe(
      tap(() => this.cartCount.update((c) => Math.max(0, c - 1))),
    );
  }

  clearCart() {
    return this.http.delete(`${this.api}/cart/clear`).pipe(
      tap(() => this.cartCount.set(0)),
    );
  }
}