import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { OrderReview } from '../../core/models';

interface ReviewStats {
  total: number;
  avgRating: number;
  payment: { total: number; avg: number };
  delivery: { total: number; avg: number };
}

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reviews.html',
  styleUrl: './reviews.css',
})
export class Reviews implements OnInit {
  http = inject(HttpClient);

  reviews = signal<OrderReview[]>([]);
  stats = signal<ReviewStats | null>(null);
  loading = signal(true);
  filterType = signal<'ALL' | 'PAYMENT' | 'DELIVERY'>('ALL');

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.http.get<OrderReview[]>('http://localhost:3000/reviews/admin/all').subscribe({
      next: (data) => { this.reviews.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.http.get<ReviewStats>('http://localhost:3000/reviews/admin/stats').subscribe({
      next: (data) => this.stats.set(data),
    });
  }

  filteredReviews(): OrderReview[] {
    const type = this.filterType();
    if (type === 'ALL') return this.reviews();
    return this.reviews().filter(r => r.type === type);
  }

  setFilter(type: 'ALL' | 'PAYMENT' | 'DELIVERY') {
    this.filterType.set(type);
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
}
