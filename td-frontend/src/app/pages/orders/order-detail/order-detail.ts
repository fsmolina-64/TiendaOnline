import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../../core/services/orders.service';
import { Order } from '../../../core/models';
import { ToastService } from '../../../core/services/toast.service';
import { environment } from '../../../../environments/environment';

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
  toastService = inject(ToastService);

  order = signal<Order | null>(null);
  loading = signal(true);

  reviewType = signal<'PAYMENT' | 'DELIVERY' | null>(null);
  reviewRating = 5;
  reviewComment = '';

  getImageUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.apiUrl + url;
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    const reviewPayment = this.route.snapshot.queryParamMap.get('reviewPayment');

    this.loadOrder(id, () => {
      if (reviewPayment === 'true' && this.canReviewPayment()) {
        this.openReview('PAYMENT');
      }
    });
  }

  loadOrder(id: string, callback?: () => void) {
    this.ordersService.getOrder(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loading.set(false);
        if (callback) callback();
      },
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
        this.toastService.success('Valoración enviada correctamente');
        this.loadOrder(o.id);
      },
      error: (err) => this.toastService.error(err.error?.message || 'Error al enviar valoración'),
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
  downloadingPdf = signal(false);

  downloadInvoice() {
    const o = this.order();
    if (!o) return;

    this.downloadingPdf.set(true);

    this.ordersService.downloadInvoice(o.id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);

        const docNumber = o.invoice ? o.invoice.number : o.id.slice(0, 8).toUpperCase();
        const docType = o.invoice ? 'factura' : 'pedido';

        const link = document.createElement('a');
        link.href = url;
        link.download = `${docType}-${docNumber}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);
        this.downloadingPdf.set(false);
      },
      error: () => this.downloadingPdf.set(false),
    });
  }
}