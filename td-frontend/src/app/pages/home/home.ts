import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
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
    this.categoriesService.getAll().subscribe((cats) => this.categories.set(cats));
    this.productsService.getAll().subscribe({
      next: (products) => {
        this.products.set(products.slice(0, 8));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}