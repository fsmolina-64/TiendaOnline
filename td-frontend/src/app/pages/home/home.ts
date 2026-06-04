import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadCategories();
    this.loadFeaturedProducts();
  }

  loadCategories() {
    this.categoriesService.getAll().subscribe((cats) => this.categories.set(cats));
  }

  loadFeaturedProducts() {
    this.productsService.getAll().subscribe({
      next: (res) => {
        const sorted = [...res.data].sort((a: any, b: any) => {
          const salesA = a.salesCount || 0;
          const salesB = b.salesCount || 0;
          if (salesB !== salesA) return salesB - salesA;
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        this.products.set(sorted.slice(0, 16));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getCategoryIcon(name: string): string {
    const text = name.toLowerCase();
    if (text.includes('animal')) return '🐾';
    if (text.includes('belleza')) return '💄';
    if (text.includes('decor')) return '🖼️';
    if (text.includes('deport')) return '⚽';
    if (text.includes('electr') || text.includes('tecnol')) return '💻';
    if (text.includes('herramienta')) return '🛠️';
    if (text.includes('hogar')) return '🏠';
    if (text.includes('juguet')) return '🧸';
    if (text.includes('moda') || text.includes('ropa')) return '👕';
    if (text.includes('muebl')) return '🛋️';
    if (text.includes('salud')) return '⚕️';
    return '📦';
  }
}