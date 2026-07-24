import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(`${this.api}/categories`);
  }

  getAllAdmin() {
    return this.http.get<Category[]>(`${this.api}/categories/admin`);
  }

  create(data: { name: string }) {
    return this.http.post<Category>(`${this.api}/categories`, data);
  }

  update(id: string, data: { name: string }) {
    return this.http.patch<Category>(`${this.api}/categories/${id}`, data);
  }

  toggle(id: string) {
    return this.http.patch<Category>(`${this.api}/categories/${id}/toggle`, {});
  }
}