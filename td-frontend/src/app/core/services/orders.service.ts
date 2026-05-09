import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  constructor(private http: HttpClient) {}

  checkout() {
    return this.http.post<Order>(`${API}/orders/checkout`, {});
  }

  getMyOrders() {
    return this.http.get<Order[]>(`${API}/orders`);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${API}/orders/${id}`);
  }

  getAllAdmin() {
    return this.http.get<Order[]>(`${API}/orders/admin/all`);
  }

  updateStatus(id: string, status: string) {
    return this.http.patch(`${API}/orders/${id}/status`, { status });
  }
}