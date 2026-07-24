import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAllAdmin(search?: string, showInactive?: boolean) {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (showInactive) params = params.set('showInactive', 'true');
    return this.http.get<any[]>(`${this.api}/users/admin/all`, { params });
  }

  getOneAdmin(id: string) {
    return this.http.get<any>(`${this.api}/users/admin/${id}`);
  }

  toggleUser(id: string) {
    return this.http.patch<any>(`${this.api}/users/admin/${id}/toggle`, {});
  }
}