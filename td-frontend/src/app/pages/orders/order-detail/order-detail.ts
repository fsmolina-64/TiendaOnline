import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  route = inject(ActivatedRoute);
  ordersService = inject(OrdersService);

  order = signal<Order | null>(null);
  loading = signal(true);
  successMsg = signal('');
  errorMsg = signal('');

  reviewType = signal<'PAYMENT' | 'DELIVERY' | null>(null);
  reviewRating = 5;
  reviewComment = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadOrder(id);
  }

  loadOrder(id: string) {
    this.ordersService.getOrder(id).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  canReviewPayment(): boolean {
    const o = this.order();
    if (!o) return false;
    const alreadyReviewed = o.reviews?.some((r) => r.type === 'PAYMENT');
    return (o.status === 'PAID' || o.status === 'DELIVERED') && !alreadyReviewed;
  }

  canReviewDelivery(): boolean {
    const o = this.order();
    if (!o) return false;
    const alreadyReviewed = o.reviews?.some((r) => r.type === 'DELIVERY');
    return o.status === 'DELIVERED' && !alreadyReviewed;
  }

  openReview(type: 'PAYMENT' | 'DELIVERY') {
    this.reviewType.set(type);
    this.reviewRating = 5;
    this.reviewComment = '';
    this.errorMsg.set('');
  }

  submitReview() {
    const o = this.order();
    const type = this.reviewType();
    if (!o || !type) return;

    this.ordersService.createReview(o.id, {
      type,
      rating: this.reviewRating,
      comment: this.reviewComment,
    }).subscribe({
      next: () => {
        this.reviewType.set(null);
        this.successMsg.set('Valoración enviada correctamente');
        this.loadOrder(o.id);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al enviar valoración');
      },
    });
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }
}