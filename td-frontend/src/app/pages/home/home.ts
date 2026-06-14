import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductDrawer } from '../../shared/components/product-drawer/product-drawer';
import { ProductCard } from '../../shared/components/product-card/product-card';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, ProductDrawer, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  selectedProductSlug = signal<string | null>(null);

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

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const carousel = (event.target as HTMLElement).closest('.categories-carousel');
    if (!carousel) return;
    event.preventDefault();
    carousel.scrollLeft += event.deltaY;
  }

  openDrawer(slug: string) {
    this.selectedProductSlug.set(slug);
  }

  closeDrawer() {
    this.selectedProductSlug.set(null);
  }

  getCategoryIcon(name: string): string {
    const text = name.toLowerCase();

    if (text.includes('electr')) return '💻';
    if (text.includes('moda')) return '👕';
    if (text.includes('hogar')) return '🏠';
    if (text.includes('muebl')) return '🛋️';
    if (text.includes('deport')) return '⚽';
    if (text.includes('belleza')) return '💄';
    if (text.includes('salud')) return '⚕️';
    if (text.includes('herramienta')) return '🛠️';
    if (text.includes('decor')) return '🖼️';
    if (text.includes('mascota')) return '🐶';
    if (text.includes('juguet')) return '🧸';
    if (text.includes('videojuego')) return '🎮';
    if (text.includes('libro')) return '📚';
    if (text.includes('automotriz')) return '🚗';
    if (text.includes('oficina')) return '🖨️';
    if (text.includes('bebé') || text.includes('bebe')) return '👶';
    if (text.includes('jardín') || text.includes('jardin')) return '🌱';
    if (text.includes('cocina')) return '🍳';
    if (text.includes('alimento')) return '🍫';
    if (text.includes('accesorio')) return '⌚';

    return '📦';
  }
}