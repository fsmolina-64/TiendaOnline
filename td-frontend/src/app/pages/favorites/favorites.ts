import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { ProductDrawer } from '../../shared/components/product-drawer/product-drawer';
import { FavoritesService } from '../../core/services/favorites.service';
import { CartService } from '../../core/services/cart.service';
import { ProductsService } from '../../core/services/products.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductDrawer],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favoritesService = inject(FavoritesService);
  cartService = inject(CartService);
  productsService = inject(ProductsService);
  toastService = inject(ToastService);

  selectedProductSlug = signal<string | null>(null);

  favorites = signal<any[]>([]);
  related = signal<any[]>([]);
  loading = signal(true);
  addingCart = signal<string | null>(null);

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.favoritesService.getAll().subscribe({
      next: (favs) => {
        this.favorites.set(favs);
        this.loading.set(false);
        this.loadRelated();
      },
      error: () => this.loading.set(false),
    });
  }

  remove(productId: string) {
    this.favoritesService.remove(productId).subscribe({
      next: () => { this.loadFavorites(); this.toastService.success('Eliminado de favoritos'); },
      error: () => this.toastService.error('Error al eliminar favorito'),
    });
  }

  addToCart(productId: string) {
    this.addingCart.set(productId);
    this.cartService.addItem(productId, 1).subscribe({
      next: () => { this.addingCart.set(null); this.toastService.success('Agregado al carrito'); },
      error: () => { this.addingCart.set(null); this.toastService.error('Error al agregar al carrito'); },
    });
  }

  openDrawer(slug: string) {
    this.selectedProductSlug.set(slug);
  }

  closeDrawer() {
    this.selectedProductSlug.set(null);
  }

  loadRelated() {
    const favs = this.favorites();
    if (favs.length === 0) {
      this.related.set([]);
      return;
    }

    const limit = favs.slice(0, 3);
    const reqs = limit.map(f => this.productsService.getBySlug(f.product.slug));

    forkJoin(reqs).subscribe({
      next: (res) => {
        const all = res.flatMap(p => (p as any).related || []);
        const ids = new Set(favs.map(f => f.productId));
        const unique = new Map();

        all.forEach(r => {
          if (!ids.has(r.id) && !unique.has(r.id)) {
            unique.set(r.id, r);
          }
        });

        this.related.set(Array.from(unique.values()).slice(0, 10));
      }
    });
  }
}