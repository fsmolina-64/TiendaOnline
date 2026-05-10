import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  ordersService = inject(OrdersService);
  orders = signal<Order[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.ordersService.getMyOrders().subscribe({
      next: (orders) => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false),
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