import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  ordersService = inject(OrdersService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  cancellingId = signal<string | null>(null);
  cancelReason = '';
  errorMsg = signal('');
  successMsg = signal('');

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.ordersService.getMyOrders().subscribe({
      next: (orders) => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCancel(orderId: string) {
    this.cancellingId.set(orderId);
    this.cancelReason = '';
    this.errorMsg.set('');
  }

  closeCancel() {
    this.cancellingId.set(null);
    this.cancelReason = '';
  }

  confirmCancel() {
    const id = this.cancellingId();
    if (!id) return;
    if (this.cancelReason.trim().length < 5) {
      this.errorMsg.set('El motivo debe tener al menos 5 caracteres');
      return;
    }

    this.ordersService.cancelOrder(id, this.cancelReason).subscribe({
      next: () => {
        this.closeCancel();
        this.successMsg.set('Orden cancelada correctamente');
        this.loadOrders();
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al cancelar');
      },
    });
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

  getStatusClass(status: string): string {
    const classes: any = {
      PENDING: 'status-pending',
      PAID: 'status-paid',
      DELIVERED: 'status-delivered',
      CANCELLED: 'status-cancelled',
    };
    return classes[status] || '';
  }
}