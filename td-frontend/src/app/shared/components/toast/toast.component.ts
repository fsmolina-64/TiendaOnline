import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div [class]="'toast toast-' + toast.type">
          <span>{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)">✕</button>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 0.85rem 1.2rem;
      border-radius: 10px;
      color: white;
      font-size: 0.9rem;
      min-width: 260px;
      max-width: 380px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideIn 0.2s ease;
    }
    .toast-success { background: #27ae60; }
    .toast-error   { background: #e94560; }
    .toast-info    { background: #2980b9; }
    .toast button {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
      opacity: 0.8;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
  `],
})
export class ToastComponent {
    toastService = inject(ToastService);
}