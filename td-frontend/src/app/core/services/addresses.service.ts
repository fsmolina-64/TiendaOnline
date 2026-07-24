import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AddressesService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Address[]>(`${this.api}/users/addresses`);
  }
}