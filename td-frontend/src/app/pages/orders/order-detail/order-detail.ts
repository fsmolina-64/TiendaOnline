import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrdersService } from '../../../core/services/orders.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order } from '../../../core/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
})
export class OrderDetail implements OnInit {
  route = inject(ActivatedRoute);
  ordersService = inject(OrdersService);
  auth = inject(AuthService);

  order = signal<Order | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ordersService.getOrder(id).subscribe({
      next: (order) => { this.order.set(order); this.loading.set(false); },
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
}