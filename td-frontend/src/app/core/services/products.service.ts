import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll(filters?: {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
  }) {
    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.minPrice) params = params.set('minPrice', filters.minPrice);
    if (filters?.maxPrice) params = params.set('maxPrice', filters.maxPrice);
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.page) params = params.set('page', filters.page);
    if (filters?.limit) params = params.set('limit', filters.limit);
    if (filters?.orderBy) params = params.set('orderBy', filters.orderBy);

    return this.http.get<{
      data: Product[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(`${this.api}/products`, { params });
  }

  getBySlug(slug: string) {
    return this.http.get<Product>(`${this.api}/products/${slug}`);
  }

  getAllAdmin() {
    return this.http.get<Product[]>(`${this.api}/products/admin/all`);
  }

  create(data: any) {
    return this.http.post<Product>(`${this.api}/products`, data);
  }

  update(id: string, data: any) {
    return this.http.patch<Product>(`${this.api}/products/${id}`, data);
  }

  toggle(id: string) {
    return this.http.patch<Product>(`${this.api}/products/${id}/toggle`, {});
  }
}