import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <a routerLink="/home">🛍️ TiendaOnline</a>
      </div>

      <div class="navbar-links">
        <a routerLink="/home" routerLinkActive="active">Inicio</a>
        <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>

        @if (auth.isLoggedIn()) {
          <a routerLink="/favorites" routerLinkActive="active">❤️ Favoritos</a>
          <a routerLink="/cart" routerLinkActive="active">
            🛒 Carrito
            @if (cart.cartCount() > 0) {
              <span class="badge">{{ cart.cartCount() }}</span>
            }
          </a>
          <a routerLink="/orders" routerLinkActive="active">Mis Pedidos</a>
          <a routerLink="/profile" routerLinkActive="active">Mi Perfil</a>

          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="admin-link">Admin</a>
          }

          <button (click)="auth.logout()" class="btn-logout">Salir</button>
        } @else {
          <a routerLink="/auth/login" routerLinkActive="active">Ingresar</a>
          <a routerLink="/auth/register" class="btn-register">Registrarse</a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 2rem;
      background: #1a1a2e;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    }
    .navbar-brand a {
      color: white;
      text-decoration: none;
      font-size: 1.4rem;
      font-weight: bold;
    }
    .navbar-links {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }
    .navbar-links a {
      color: #ccc;
      text-decoration: none;
      font-size: 0.95rem;
      position: relative;
      transition: color 0.2s;
    }
    .navbar-links a:hover, .navbar-links a.active {
      color: white;
    }
    .badge {
      background: #e94560;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.7rem;
      margin-left: 4px;
    }
    .admin-link {
      color: #f0a500 !important;
      font-weight: bold;
    }
    .btn-logout {
      background: transparent;
      border: 1px solid #e94560;
      color: #e94560;
      padding: 0.4rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: #e94560;
      color: white;
    }
    .btn-register {
      background: #e94560;
      color: white !important;
      padding: 0.4rem 1rem;
      border-radius: 4px;
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}