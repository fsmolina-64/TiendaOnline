import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface DeliveryEstimate {
  distanceKm: number;
  durationMin: number;
  estimatedArrival: string;
  method: 'osrm' | 'haversine';
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private readonly api = environment.apiUrl;
  private http = inject(HttpClient);

  estimate(addressId: string) {
    return this.http.post<DeliveryEstimate>(`${this.api}/delivery/estimate`, { addressId });
  }
}
