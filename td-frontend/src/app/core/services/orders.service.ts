import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private http: HttpClient) { }

  checkout(body: object) {
    return this.http.post<Order>(`${API}/orders/checkout`, body);
  }

  getMyOrders() {
    return this.http.get<Order[]>(`${API}/orders`);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${API}/orders/${id}`);
  }

  cancelOrder(id: string, cancelReason: string) {
    return this.http.patch<Order>(`${API}/orders/${id}/cancel`, { cancelReason });
  }

  getAllAdmin() {
    return this.http.get<Order[]>(`${API}/orders/admin/all`);
  }

  updateStatus(id: string, status: string, cancelReason?: string) {
    return this.http.patch(`${API}/orders/${id}/status`, { status, cancelReason });
  }

  createReview(orderId: string, data: { type: string; rating: number; comment?: string }) {
    return this.http.post(`${API}/reviews/${orderId}`, data);
  }
  downloadInvoice(orderId: string) {
    return this.http.get(`${API}/invoices/${orderId}/download`, {
      responseType: 'blob',
    });
  }
}