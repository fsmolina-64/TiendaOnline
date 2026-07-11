import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface DeliveryEstimate {
  distanceKm: number;
  durationMin: number;
  estimatedArrival: string;
  method: 'osrm' | 'haversine';
}

@Injectable({ providedIn: 'root' })
export class DeliveryService {
  private http = inject(HttpClient);

  estimate(addressId: string) {
    return this.http.post<DeliveryEstimate>('http://localhost:3000/delivery/estimate', { addressId });
  }
}
