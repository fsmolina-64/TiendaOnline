import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../core/services/orders.service';
import { Order } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {
  ordersService = inject(OrdersService);
  toastService = inject(ToastService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  cancellingId = signal<string | null>(null);
  cancelReason = '';

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
        this.toastService.success('Estado actualizado');
      },
      error: () => this.toastService.error('Error al actualizar estado'),
    });
  }

  openCancel(orderId: string) {
    this.cancellingId.set(orderId);
    this.cancelReason = '';
  }

  closeCancel() {
    this.cancellingId.set(null);
    this.cancelReason = '';
  }

  confirmCancel() {
    const id = this.cancellingId();
    if (!id) return;
    if (this.cancelReason.trim().length < 5) {
      this.toastService.error('El motivo debe tener al menos 5 caracteres');
      return;
    }
    this.ordersService.cancelOrder(id, this.cancelReason).subscribe({
      next: () => {
        this.closeCancel();
        this.toastService.success('Orden cancelada correctamente');
        this.loadOrders();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Error al cancelar'),
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = { PENDING: 'Pendiente', PAID: 'Pagado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado' };
    return labels[status] || status;
  }
}