import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  ordersService = inject(OrdersService);
  orders = signal<Order[]>([]);
  loading = signal(true);
  successMsg = signal('');

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.ordersService.getAllAdmin().subscribe({
      next: (orders) => { this.orders.set(orders); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(orderId: string, status: string) {
    this.ordersService.updateStatus(orderId, status).subscribe({
      next: () => {
        this.loadOrders();
        this.successMsg.set('Estado actualizado');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = { PENDING: 'Pendiente', PAID: 'Pagado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado' };
    return labels[status] || status;
  }
}