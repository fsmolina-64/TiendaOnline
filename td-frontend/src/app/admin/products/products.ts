import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Product, Category } from '../../core/models';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  fb = inject(FormBuilder);
  http = inject(HttpClient);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  successMsg = signal('');
  errorMsg = signal('');
  selectedFiles: File[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0.01)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    categoryId: ['', Validators.required],
  });

  ngOnInit() {
    this.loadProducts();
    this.categoriesService.getAllAdmin().subscribe((cats) => this.categories.set(cats));
  }

  loadProducts() {
    this.productsService.getAllAdmin().subscribe({
      next: (products) => { this.products.set(products); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ price: 0, stock: 0 });
    this.showForm.set(true);
  }

  openEdit(product: Product) {
    this.editingId.set(product.id);
    this.form.patchValue({
      name: product.name,
      description: product.description || '',
      price: product.originalPrice,
      stock: product.stock,
      categoryId: product.categoryId,
    });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return;
    const data = this.form.value;
    const id = this.editingId();

    const request = id
      ? this.productsService.update(id, data)
      : this.productsService.create(data);

    request.subscribe({
      next: () => {
        this.showForm.set(false);
        this.loadProducts();
        this.successMsg.set(id ? 'Producto actualizado' : 'Producto creado');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al guardar');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  toggle(product: Product) {
    this.productsService.toggle(product.id).subscribe({
      next: () => this.loadProducts(),
    });
  }

  onFilesSelected(event: any) {
    this.selectedFiles = Array.from(event.target.files);
  }

  uploadImages(productId: string) {
    if (this.selectedFiles.length === 0) return;
    const formData = new FormData();
    this.selectedFiles.forEach((f) => formData.append('images', f));
    this.http.post(`http://localhost:3000/uploads/products/${productId}`, formData).subscribe({
      next: () => {
        this.loadProducts();
        this.selectedFiles = [];
        this.successMsg.set('Imágenes subidas correctamente');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
    });
  }

  deleteImage(imageId: string) {
    this.http.delete(`http://localhost:3000/uploads/images/${imageId}`).subscribe({
      next: () => this.loadProducts(),
    });
  }
}