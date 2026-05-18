import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart } from '../../core/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  cartService = inject(CartService);
  ordersService = inject(OrdersService);
  auth = inject(AuthService);
  router = inject(Router);

  cart = signal<Cart | null>(null);
  loading = signal(true);
  processing = signal(false);
  error = signal('');

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        if (cart.items.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  placeOrder() {
    this.processing.set(true);
    this.error.set('');

    this.ordersService.checkout().subscribe({
next: (order) => {
  this.router.navigate(['/orders', order.id], { 
    queryParams: { reviewPayment: true } 
  });
},
      error: (err) => {
        this.error.set(err.error?.message || 'Error al procesar el pedido');
        this.processing.set(false);
      },
    });
  }
}