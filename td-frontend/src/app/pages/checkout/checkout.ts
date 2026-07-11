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

  // Variables del formulario de tarjeta
  cardNumber = '';
  cardType: 'Visa' | 'Mastercard' | 'Amex' | 'Desconocida' = 'Desconocida';
  cardExpiry = '';
  cardCvv = '';

  // Modal de Valoración
  showReviewModal = signal(false);
  reviewRating = 5;
  reviewComment = '';
  completedOrderId = signal<string | null>(null);

  readonly bankInfo = {
    bank: 'Banco Pichincha',
    account: '2100845690 (Ahorros)',
    holder: 'FeliMarket S.A.',
    email: 'pagos@felimarket.com'
  };

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        if (cart.items.length === 0) { this.router.navigate(['/cart']); return; }
        this.cart.set(cart);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/cart']);
      },
    });

    this.addressesService.getAll().subscribe({
      next: (addresses) => {
        const def = addresses.find((a) => a.isDefault) || addresses[0] || null;
        this.defaultAddress.set(def);
      },
    });
  }

  // --- Formateo de Tarjeta Realista ---
  formatCardNumber(event: any) {
    let val = event.target.value.replace(/\D/g, ''); // Solo números
    if (val.length > 16) val = val.substring(0, 16);

    // Detectar franquicia básica
    if (val.startsWith('4')) this.cardType = 'Visa';
    else if (val.startsWith('5')) this.cardType = 'Mastercard';
    else if (val.startsWith('3')) this.cardType = 'Amex';
    else this.cardType = 'Desconocida';

    // Agregar espacios
    const parts = val.match(/.{1,4}/g);
    this.cardNumber = parts ? parts.join(' ') : val;
  }

  formatExpiry(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    if (val.length >= 2) {
      this.cardExpiry = val.substring(0, 2) + '/' + val.substring(2);
    } else {
      this.cardExpiry = val;
    }
  }

  formatCvv(event: any) {
    let val = event.target.value.replace(/\D/g, '');
    if (val.length > 4) val = val.substring(0, 4);
    this.cardCvv = val;
  }

  // --- Validaciones ---
  isCardValid(): boolean {
    if (this.paymentMethod !== 'CARD') return true;
    const cleanCard = this.cardNumber.replace(/\s/g, '');
    return (
      cleanCard.length >= 15 &&
      /^(0[1-9]|1[0-2])\/\d{2}$/.test(this.cardExpiry) &&
      /^\d{3,4}$/.test(this.cardCvv)
    );
  }

  canSubmitOrder(): boolean {
    return !!this.defaultAddress() && this.isCardValid();
  }

  // --- Flujo de Compra ---
  placeOrder() {
    this.error.set('');

    // 1. Validación Centralizada Obligatoria
    if (!this.defaultAddress()) {
      this.error.set('Por favor, ingresa una dirección de entrega válida antes de continuar.');
      return;
    }
    if (!this.isCardValid()) {
      this.error.set('Por favor, completa los datos de la tarjeta correctamente.');
      return;
    }

    this.processing.set(true);

    const body: any = { paymentMethod: this.paymentMethod };
    if (this.paymentMethod === 'CARD') {
      body.cardNumber = this.cardNumber.replace(/\s/g, '');
      body.cardType = this.cardType;
      body.expiryDate = this.cardExpiry;
      body.cvv = this.cardCvv;
    }

    this.ordersService.checkout(body).subscribe({
      next: (order) => {
        this.processing.set(false);
        // Si es Tarjeta o Transferencia, mostramos modal de valoración de PAGO inmediatamente
        if (this.paymentMethod === 'CARD' || this.paymentMethod === 'TRANSFER') {
          this.completedOrderId.set(order.id);
          this.showReviewModal.set(true);
        } else {
          // Si es Efectivo, se va directo a orders (valorará todo después)
          this.router.navigate(['/orders']);
        }
      },
      error: (err) => {
        this.processing.set(false);
        this.error.set(err.error?.message || 'Hubo un problema al procesar el pedido.');
      },
    });
  }

  // --- Modal de Valoración ---
  submitReview() {
    const oId = this.completedOrderId();
    if (!oId) return;

    this.ordersService.createReview(oId, {
      type: 'PAYMENT',
      rating: this.reviewRating,
      comment: this.reviewComment,
    }).subscribe({
      next: () => {
        this.showReviewModal.set(false);
        this.router.navigate(['/orders']);
      },
      error: () => {
        this.showReviewModal.set(false);
        this.router.navigate(['/orders']);
      },
    });
  }

  skipReview() {
    this.showReviewModal.set(false);
    this.router.navigate(['/orders']);
  }
}