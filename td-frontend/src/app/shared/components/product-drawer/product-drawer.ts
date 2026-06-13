import { Component, EventEmitter, inject, Input, Output, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { ToastService } from '../../../core/services/toast.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { FavoritesService } from '../../../core/services/favorites.service';
import { Product } from '../../../core/models';

@Component({
    selector: 'app-product-drawer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './product-drawer.html',
    styleUrl: './product-drawer.css'
})
export class ProductDrawer {
    @Input() set productSlug(slug: string | null) {
        if (slug) this.loadProduct(slug);
    }
    @Output() close = new EventEmitter<void>();

    productsService = inject(ProductsService);
    cartService = inject(CartService);
    auth = inject(AuthService);
    favoritesService = inject(FavoritesService);
    toastService = inject(ToastService);

    product = signal<Product | null>(null);
    related = signal<Product[]>([]);
    activeImage = signal<string>('');
    expanded = signal(false);
    loading = signal(false);
    isFavorite = signal(false);
    adding = signal(false);
    favoriteAdding = signal(false);

    @HostListener('document:keydown.escape')
    onEscape() {
        this.closeDrawer();
    }

    loadProduct(slug: string) {
        this.loading.set(true);
        this.productsService.getBySlug(slug).subscribe({
            next: (res) => {
                this.product.set(res);
                this.related.set((res as any).related || []);
                this.activeImage.set(res.images?.[0]?.url || '');
                this.checkFavorite(res.id);
                this.loading.set(false);
            },
            error: () => this.loading.set(false)
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

    toggleFavorite() {
        const p = this.product();
        if (!p || !this.auth.isLoggedIn() || this.favoriteAdding()) return;

        this.favoriteAdding.set(true);
        if (this.isFavorite()) {
            this.favoritesService.remove(p.id).subscribe({
                next: () => {
                    this.isFavorite.set(false);
                    this.toastService.success('Favorito removido');
                    this.favoriteAdding.set(false);
                },
                error: () => this.favoriteAdding.set(false)
            });
        } else {
            this.favoritesService.add(p.id).subscribe({
                next: () => {
                    this.isFavorite.set(true);
                    this.toastService.success('Favorito agregado');
                    this.favoriteAdding.set(false);
                },
                error: () => this.favoriteAdding.set(false)
            });
        }
    }

    addToCart() {
        const p = this.product();
        if (!p || !this.auth.isLoggedIn()) return;

        this.adding.set(true);
        this.cartService.addItem(p.id, 1).subscribe({
            next: () => {
                this.toastService.success('Producto agregado');
                setTimeout(() => this.adding.set(false), 1500);
            },
            error: () => this.adding.set(false)
        });
    }

    closeDrawer() { this.close.emit(); }
    toggleExpand() { this.expanded.update(e => !e); }
    setImage(url: string) { this.activeImage.set(url); }

    loadRelated(slug: string) {
        this.loadProduct(slug);
    }
}