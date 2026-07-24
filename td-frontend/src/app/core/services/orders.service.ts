import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  checkout(body: object) {
    return this.http.post<Order>(`${this.api}/orders/checkout`, body);
  }

  getMyOrders() {
    return this.http.get<Order[]>(`${this.api}/orders`);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.api}/orders/${id}`);
  }

  cancelOrder(id: string, cancelReason: string) {
    return this.http.patch<Order>(`${this.api}/orders/${id}/cancel`, { cancelReason });
  }

  getAllAdmin() {
    return this.http.get<Order[]>(`${this.api}/orders/admin/all`);
  }

  updateStatus(id: string, status: string, cancelReason?: string) {
    return this.http.patch(`${this.api}/orders/${id}/status`, { status, cancelReason });
  }

  createReview(orderId: string, data: { type: string; rating: number; comment?: string }) {
    return this.http.post(`${this.api}/reviews/${orderId}`, data);
  }
  downloadInvoice(orderId: string) {
    return this.http.get(`${this.api}/invoices/${orderId}/download`, {
      responseType: 'blob',
    });
  }
}