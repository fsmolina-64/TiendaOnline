import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { OrdersService } from '../../core/services/orders.service';
import { AddressesService } from '../../core/services/addresses.service';
import { Cart as CartModel, Address } from '../../core/models';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  paymentMethod: 'CARD' | 'TRANSFER' | 'CASH' = 'CARD';
  cardNumber = '';
  cardType: 'Visa' | 'Mastercard' | 'Amex' = 'Visa';
  cardExpiry = '';
  cardCvv = '';

  readonly bankInfo = {
    bank: 'Banco Pichincha',
    account: '2201234567',
    holder: 'TiendaOnline S.A.',
    type: 'Cuenta Corriente',
  };

  isCardValid(): boolean {
    if (this.paymentMethod !== 'CARD') return true;
    return (
      /^\d{16}$/.test(this.cardNumber.replace(/\s/g, '')) &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.cardExpiry) &&
      /^\d{3,4}$/.test(this.cardCvv)
    );
  }
  ngOnInit() {
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
    if (!this.isCardValid()) { this.error.set('Datos de tarjeta inválidos'); return; }
    this.processing.set(true);
    this.error.set('');
    const body: any = { paymentMethod: this.paymentMethod };
    if (this.paymentMethod === 'CARD') {
      body.cardNumber = this.cardNumber.replace(/\s/g, '');
      body.cardType = this.cardType;
      body.expiryDate = this.cardExpiry;
      body.cvv = this.cardCvv;
    }
    this.ordersService.checkout(body).subscribe({
      next: (order) => {
        if (this.paymentMethod === 'CARD') {
          this.router.navigate(['/orders', order.id], { queryParams: { reviewPayment: true } });
        } else {
          this.router.navigate(['/orders', order.id]);
        }
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al procesar el pedido');
        this.processing.set(false);
      },
    });
  }
}