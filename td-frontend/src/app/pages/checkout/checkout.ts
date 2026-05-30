import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AddressesService } from '../../core/services/addresses.service';
import { Cart as CartModel, Address } from '../../core/models';

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
  addressesService = inject(AddressesService);
  router = inject(Router);

  cart = signal<CartModel | null>(null);
  defaultAddress = signal<Address | null>(null);
  loading = signal(true);
  processing = signal(false);
  error = signal('');

  ngOnInit() {
    // Cargamos carrito y direcciones en paralelo
    this.cartService.getCart().subscribe({
      next: (cart) => {
        if (cart.items.length === 0) { this.router.navigate(['/cart']); return; }
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.addressesService.getAll().subscribe({
      next: (addresses) => {
        const def = addresses.find((a) => a.isDefault) || addresses[0] || null;
        this.defaultAddress.set(def);
      },
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