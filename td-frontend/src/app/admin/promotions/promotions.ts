import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models';

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

  promotions = signal<any[]>([]);
  products = signal<Product[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  successMsg = signal('');
  errorMsg = signal('');

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
    this.http.get<any[]>('http://localhost:3000/promotions').subscribe({
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
      ? this.http.patch(`http://localhost:3000/promotions/${id}`, body)
      : this.http.post(`http://localhost:3000/promotions/${val.productId}`, body);

    request.subscribe({
      next: () => {
        this.showForm.set(false);
        this.loadPromotions();
        this.successMsg.set(id ? 'Promoción actualizada' : 'Promoción creada');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al guardar');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  toggle(id: string) {
    this.http.patch(`http://localhost:3000/promotions/${id}/toggle`, {}).subscribe({
      next: () => this.loadPromotions(),
    });
  }

  remove(id: string) {
    if (!confirm('¿Eliminar esta promoción?')) return;
    this.http.delete(`http://localhost:3000/promotions/${id}`).subscribe({
      next: () => this.loadPromotions(),
    });
  }
}