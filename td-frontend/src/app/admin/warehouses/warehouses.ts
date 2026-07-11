import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LocationPicker, LocationResult } from '../../shared/components/location-picker/location-picker';
import { ToastService } from '../../core/services/toast.service';

interface Warehouse {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-admin-warehouses',
  standalone: true,
  imports: [CommonModule, FormsModule, LocationPicker],
  templateUrl: './warehouses.html',
  styleUrl: './warehouses.css',
})
export class AdminWarehouses implements OnInit {
  http = inject(HttpClient);
  toastService = inject(ToastService);

  warehouse = signal<Warehouse | null>(null);
  loading = signal(true);
  editing = signal(false);

  form: {
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  } = {
    name: '',
    address: '',
    latitude: null,
    longitude: null,
  };

  ngOnInit() {
    this.loadWarehouse();
  }

  loadWarehouse() {
    this.loading.set(true);
    this.http.get<Warehouse[]>('http://localhost:3000/warehouses').subscribe({
      next: (list) => {
        this.warehouse.set(list[0] || null);
        if (list[0]) {
          this.form = {
            name: list[0].name,
            address: list[0].address,
            latitude: list[0].latitude,
            longitude: list[0].longitude,
          };
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.form = { name: '', address: '', latitude: -2.9006, longitude: -79.0046 };
    this.editing.set(true);
  }

  openEdit() {
    const w = this.warehouse();
    if (w) {
      this.form = {
        name: w.name,
        address: w.address,
        latitude: w.latitude,
        longitude: w.longitude,
      };
    }
    this.editing.set(true);
  }

  onLocationChanged(result: LocationResult | null) {
    if (!result) {
      this.form.latitude = null;
      this.form.longitude = null;
      this.form.address = '';
      return;
    }
    this.form.latitude = result.lat;
    this.form.longitude = result.lng;
    this.form.address = result.address;
  }

  save() {
    if (this.form.latitude === null || this.form.longitude === null) {
      this.toastService.error('Debes seleccionar una ubicación en el mapa');
      return;
    }
    const existing = this.warehouse();
    const body = {
      name: this.form.name,
      address: this.form.address,
      latitude: this.form.latitude,
      longitude: this.form.longitude,
    };

    if (existing) {
      this.http.patch<Warehouse>(`http://localhost:3000/warehouses/${existing.id}`, body).subscribe({
        next: (w) => {
          this.warehouse.set(w);
          this.editing.set(false);
          this.toastService.success('Bodega actualizada');
        },
        error: () => this.toastService.error('Error al actualizar bodega'),
      });
    } else {
      this.http.post<Warehouse>('http://localhost:3000/warehouses', body).subscribe({
        next: (w) => {
          this.warehouse.set(w);
          this.form = { name: w.name, address: w.address, latitude: w.latitude, longitude: w.longitude };
          this.editing.set(false);
          this.toastService.success('Bodega creada');
        },
        error: () => this.toastService.error('Error al crear bodega'),
      });
    }
  }

  cancelEdit() {
    this.editing.set(false);
    const w = this.warehouse();
    if (w) {
      this.form = { name: w.name, address: w.address, latitude: w.latitude, longitude: w.longitude };
    }
  }
}
