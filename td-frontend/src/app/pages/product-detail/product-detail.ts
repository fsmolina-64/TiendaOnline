import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  route = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  cartService = inject(CartService);
  auth = inject(AuthService);

  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  selectedImage = signal(0);
  addedToCart = signal(false);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.productsService.getBySlug(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  increaseQty() {
    const p = this.product();
    if (p && this.quantity() < p.stock) {
      this.quantity.update((q) => q + 1);
    }
  }

  decreaseQty() {
    if (this.quantity() > 1) this.quantity.update((q) => q - 1);
  }

  addToCart() {
    const p = this.product();
    if (!p) return;

    this.cartService.addItem(p.id, this.quantity()).subscribe({
      next: () => {
        this.addedToCart.set(true);
        setTimeout(() => this.addedToCart.set(false), 2000);
      },
    });
  }
}