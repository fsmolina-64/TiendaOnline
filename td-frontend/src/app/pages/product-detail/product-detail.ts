import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { Product } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';

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
  toastService = inject(ToastService);

  product = signal<Product | null>(null);
  loading = signal(true);
  quantity = signal(1);
  selectedImage = signal(0);
  addedToCart = signal(false);
  isFavorite = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (!slug) return;

      this.loading.set(true);
      this.error.set(null);

      this.productsService.getBySlug(slug).subscribe({
        next: (p) => {
          this.product.set(p);
          this.related.set((p as any).related || []);
          this.loading.set(false);
          this.checkFavorite(p.id);
          window.scrollTo(0, 0);
        },
        error: () => {
          this.error.set('Producto no encontrado');
          this.loading.set(false);
        },
      });
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
        this.toastService.success('Agregado al carrito');
        setTimeout(() => this.addedToCart.set(false), 2000);
      },
      error: () => this.toastService.error('Error al agregar al carrito'),
    });
  }

  addToFavorites() {
    const p = this.product();
    if (!p) return;
    this.favoritesService.add(p.id).subscribe({
      next: () => { this.isFavorite.set(true); this.toastService.success('Agregado a favoritos'); },
      error: () => this.toastService.error('Error al agregar a favoritos'),
    });
  }

  removeFromFavorites() {
    const p = this.product();
    if (!p) return;
    this.favoritesService.remove(p.id).subscribe({
      next: () => { this.isFavorite.set(false); this.toastService.success('Eliminado de favoritos'); },
      error: () => this.toastService.error('Error al eliminar de favoritos'),
    });
  }
  related = signal<Product[]>([]);
}