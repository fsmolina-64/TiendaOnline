import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Category[]>(`${API}/categories`);
  }

  getAllAdmin() {
    return this.http.get<Category[]>(`${API}/categories/admin`);
  }

  create(data: { name: string }) {
    return this.http.post<Category>(`${API}/categories`, data);
  }

  update(id: string, data: { name: string }) {
    return this.http.patch<Category>(`${API}/categories/${id}`, data);
  }

  toggle(id: string) {
    return this.http.patch<Category>(`${API}/categories/${id}/toggle`, {});
  }
}