import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { Cart as CartModel } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  cartService = inject(CartService);

  cart = signal<CartModel | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateItem(productId, quantity).subscribe({
      next: () => this.loadCart(),
    });
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId).subscribe({
      next: () => this.loadCart(),
    });
  }

  clearCart() {
    this.cartService.clearCart().subscribe({
      next: () => this.loadCart(),
    });
  }
}