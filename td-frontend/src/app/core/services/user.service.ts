import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private http: HttpClient) {}

  getAllAdmin(search?: string, showInactive?: boolean) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (showInactive) params = params.set('showInactive', 'true');
    return this.http.get<any[]>(`${API}/users/admin/all`, { params });
  }

  getOneAdmin(id: string) {
    return this.http.get<any>(`${API}/users/admin/${id}`);
  }

  toggleUser(id: string) {
    return this.http.patch<any>(`${API}/users/admin/${id}/toggle`, {});
  }
}