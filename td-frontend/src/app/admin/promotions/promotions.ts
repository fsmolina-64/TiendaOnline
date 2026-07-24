import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotions.html',
  styleUrl: './promotions.css',
})
export class Promotions implements OnInit {
  http = inject(HttpClient);
  productsService = inject(ProductsService);
  fb = inject(FormBuilder);
  toastService = inject(ToastService);

  promotions = signal<any[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);

  form = this.fb.group({
    productId: ['', Validators.required],
    discount: [10, [Validators.required, Validators.min(1), Validators.max(100)]],
    startDate: ['', Validators.required],
    endDate: ['', Validators.required],
    isActive: [true],
  });

  ngOnInit() {
    this.loadPromotions();
    this.productsService.getAllAdmin().subscribe((p) => this.products.set(p));
  }

  loadPromotions() {
    this.http.get<any[]>(`${environment.apiUrl}/promotions`).subscribe({
      next: (data) => { this.promotions.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ discount: 10, isActive: true });
    this.showForm.set(true);
  }

  openEdit(promo: any) {
    this.editingId.set(promo.id);
    this.form.patchValue({
      productId: promo.productId,
      discount: promo.discount,
      startDate: promo.startDate.slice(0, 10),
      endDate: promo.endDate.slice(0, 10),
      isActive: promo.isActive,
    });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return;
    const id = this.editingId();
    const val = this.form.value;
    const body = {
      discount: val.discount,
      startDate: new Date(val.startDate!).toISOString(),
      endDate: new Date(val.endDate!).toISOString(),
      isActive: val.isActive,
    };
    const request = id
      ? this.http.patch(`${environment.apiUrl}/promotions/${id}`, body)
      : this.http.post(`${environment.apiUrl}/promotions/${val.productId}`, body);
    request.subscribe({
      next: () => { this.showForm.set(false); this.loadPromotions(); this.toastService.success(id ? 'Promoción actualizada' : 'Promoción creada'); },
      error: (err) => this.toastService.error(err.error?.message || 'Error al guardar'),
    });
  }

  toggle(id: string) {
    this.http.patch(`${environment.apiUrl}/promotions/${id}/toggle`, {}).subscribe({
      next: () => { this.loadPromotions(); this.toastService.success('Estado actualizado'); },
      error: () => this.toastService.error('Error al cambiar estado'),
    });
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta promoción?')) return;
    this.http.delete(`${environment.apiUrl}/promotions/${id}`).subscribe({
      next: () => { this.loadPromotions(); this.toastService.success('Promoción eliminada'); },
      error: () => this.toastService.error('Error al eliminar'),
    });
  }
}