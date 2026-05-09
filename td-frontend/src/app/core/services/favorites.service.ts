import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(`${API}/favorites`);
  }

  add(productId: string) {
    return this.http.post(`${API}/favorites/${productId}`, {});
  }

  remove(productId: string) {
    return this.http.delete(`${API}/favorites/${productId}`);
  }
}