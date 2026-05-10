import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favoritesService = inject(FavoritesService);
  favorites = signal<any[]>([]);
  loading = signal(true);

  ngOnInit() { this.loadFavorites(); }

  loadFavorites() {
    this.favoritesService.getAll().subscribe({
      next: (favs) => { this.favorites.set(favs); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  remove(productId: string) {
    this.favoritesService.remove(productId).subscribe({
      next: () => this.loadFavorites(),
    });
  }
}