import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Product, Category } from '../../core/models';
import { ProductDrawer } from '../../shared/components/product-drawer/product-drawer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductDrawer],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
})
export class Catalog implements OnInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);
  total = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);

  selectedCategory = '';
  minPrice?: number;
  maxPrice?: number;
  search = '';
  orderBy = 'newest';
  limit = 12;

  selectedProductSlug = signal<string | null>(null);

  getImageUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.apiUrl + url;
  }

  ngOnInit() {
    this.categoriesService.getAll().subscribe((cats) => this.categories.set(cats));
    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) this.selectedCategory = params['categoryId'];
      this.applyFilters();
    });
  }

  applyFilters(page = 1) {
    this.loading.set(true);
    this.currentPage.set(page);

    this.productsService.getAll({
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      search: this.search || undefined,
      orderBy: this.orderBy,
      page,
      limit: this.limit,
    }).subscribe({
      next: (res) => {
        this.products.set(res.data);
        this.total.set(res.total);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  clearFilters() {
    this.selectedCategory = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.search = '';
    this.orderBy = 'newest';
    this.applyFilters();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.applyFilters(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getPages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];

    const start = Math.max(1, current - 2);
    const end = Math.min(total, current + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  openDrawer(slug: string) {
    this.selectedProductSlug.set(slug);
  }

  closeDrawer() {
    this.selectedProductSlug.set(null);
  }
}