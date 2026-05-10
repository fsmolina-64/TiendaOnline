import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
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
  favoritesService = inject(FavoritesService);

  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  selectedImage = signal(0);
  addedToCart = signal(false);
  isFavorite = signal(false);

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug')!;
    this.productsService.getBySlug(slug).subscribe({
      next: (p) => {
        this.product.set(p);
        this.loading.set(false);
        this.checkFavorite(p.id);
      },
      error: () => this.loading.set(false),
    });
  }

  checkFavorite(productId: string) {
    if (!this.auth.isLoggedIn()) return;
    this.favoritesService.getAll().subscribe({
      next: (favs) => {
        this.isFavorite.set(favs.some((f: any) => f.productId === productId));
      },
    });
  }

  increaseQty() {
    const p = this.product();
    if (p && this.quantity() < p.stock) this.quantity.update((q) => q + 1);
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

  addToFavorites() {
    const p = this.product();
    if (!p) return;
    this.favoritesService.add(p.id).subscribe({
      next: () => this.isFavorite.set(true),
    });
  }

  removeFromFavorites() {
    const p = this.product();
    if (!p) return;
    this.favoritesService.remove(p.id).subscribe({
      next: () => this.isFavorite.set(false),
    });
  }
}