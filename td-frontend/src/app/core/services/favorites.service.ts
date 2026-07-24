import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<any[]>(`${this.api}/favorites`);
  }

  add(productId: string) {
    return this.http.post(`${this.api}/favorites/${productId}`, {});
  }

  remove(productId: string) {
    return this.http.delete(`${this.api}/favorites/${productId}`);
  }
}