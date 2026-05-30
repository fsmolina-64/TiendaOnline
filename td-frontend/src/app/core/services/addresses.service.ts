import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address } from '../models';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AddressesService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Address[]>(`${API}/users/addresses`);
  }
}