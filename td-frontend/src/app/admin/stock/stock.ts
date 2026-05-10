import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductsService } from '../../core/services/products.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-admin-stock',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
})
export class Stock implements OnInit {
  http = inject(HttpClient);
  productsService = inject(ProductsService);
  fb = inject(FormBuilder);

  products = signal<Product[]>([]);
  selectedProduct = signal<Product | null>(null);
  movements = signal<any[]>([]);
  loading = signal(true);
  successMsg = signal('');
  errorMsg = signal('');

  addForm = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: [''],
  });

  adjustForm = this.fb.group({
    quantity: [1, [Validators.required, Validators.min(1)]],
    reason: [''],
  });

  ngOnInit() {
    this.productsService.getAllAdmin().subscribe({
      next: (products) => { this.products.set(products); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  selectProduct(product: Product) {
    this.selectedProduct.set(product);
    this.loadMovements(product.id);
  }

  loadMovements(productId: string) {
    this.http.get<any>(`http://localhost:3000/stock/${productId}/movements`).subscribe({
      next: (data) => this.movements.set(data.movements),
    });
  }

  addStock() {
    if (this.addForm.invalid || !this.selectedProduct()) return;
    const productId = this.selectedProduct()!.id;
    this.http.post(`http://localhost:3000/stock/${productId}/add`, this.addForm.value).subscribe({
      next: () => {
        this.successMsg.set('Stock agregado correctamente');
        this.addForm.reset({ quantity: 1 });
        this.loadMovements(productId);
        this.productsService.getAllAdmin().subscribe((p) => {
          this.products.set(p);
          this.selectedProduct.set(p.find((x) => x.id === productId) || null);
        });
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al agregar stock');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  adjustStock() {
    if (this.adjustForm.invalid || !this.selectedProduct()) return;
    const productId = this.selectedProduct()!.id;
    this.http.post(`http://localhost:3000/stock/${productId}/adjust`, this.adjustForm.value).subscribe({
      next: () => {
        this.successMsg.set('Ajuste realizado correctamente');
        this.adjustForm.reset({ quantity: 1 });
        this.loadMovements(productId);
        this.productsService.getAllAdmin().subscribe((p) => {
          this.products.set(p);
          this.selectedProduct.set(p.find((x) => x.id === productId) || null);
        });
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al ajustar stock');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }
}