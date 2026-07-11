import { Component, inject } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
    selector: 'app-loading',
    standalone: true,
    template: `
    @if (loadingService.isLoading()) {
      <div class="loading-overlay">
        <div class="spinner"></div>
      </div>
    }
  `,
    styles: [`
    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 9998;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 5px solid #fff;
      border-top-color: #e94560;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `],
})
export class LoadingComponent {
    loadingService = inject(LoadingService);
}