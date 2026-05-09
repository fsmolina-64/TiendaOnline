import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  constructor(private http: HttpClient) {}

  getAll(filters?: { categoryId?: string; minPrice?: number; maxPrice?: number; search?: string }) {
    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    if (filters?.search) params = params.set('search', filters.search);

    return this.http.get<Product[]>(`${API}/products`, { params });
  }

  getBySlug(slug: string) {
    return this.http.get<Product>(`${API}/products/${slug}`);
  }

  getAllAdmin() {
    return this.http.get<Product[]>(`${API}/products/admin/all`);
  }

  create(data: any) {
    return this.http.post<Product>(`${API}/products`, data);
  }

  update(id: string, data: any) {
    return this.http.patch<Product>(`${API}/products/${id}`, data);
  }

  toggle(id: string) {
    return this.http.patch<Product>(`${API}/products/${id}/toggle`, {});
  }
}