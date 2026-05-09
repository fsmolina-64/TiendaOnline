import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../core/services/products.service';
import { CategoriesService } from '../../core/services/categories.service';
import { Product, Category } from '../../core/models';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl:'./catalog.html',
  styleUrls: ['./catalog.css']
})
export class Catalog implements OnInit {
  productsService = inject(ProductsService);
  categoriesService = inject(CategoriesService);
  route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  loading = signal(true);

  selectedCategory = '';
  minPrice?: number;
  maxPrice?: number;
  search = '';

  ngOnInit() {
    this.categoriesService.getAll().subscribe((cats) => this.categories.set(cats));

    this.route.queryParams.subscribe((params) => {
      if (params['categoryId']) this.selectedCategory = params['categoryId'];
      this.applyFilters();
    });
  }

  applyFilters() {
    this.loading.set(true);
    this.productsService.getAll({
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      search: this.search || undefined,
    }).subscribe({
      next: (products) => {
        this.products.set(products);
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
    this.applyFilters();
  }
}