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
          <a routerLink="/cart" routerLinkActive="active" class="cart-link">
            🛒 Carrito
            @if (cart.cartCount() > 0) {
              <span class="badge">{{ cart.cartCount() }}</span>
            }
          </a>
          <a routerLink="/orders" routerLinkActive="active">Mis Pedidos</a>
          <a routerLink="/profile" routerLinkActive="active" class="profile-link">
            @if (auth.currentUser()?.avatar) {
              <img [src]="auth.currentUser()!.avatar!" alt="avatar" class="nav-avatar" />
            } @else {
              <span class="nav-avatar-placeholder">
                {{ auth.currentUser()?.name?.charAt(0)?.toUpperCase() }}
              </span>
            }
            Mi Perfil
          </a>

          @if (auth.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="admin-link">⚙️ Admin</a>
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
      padding: 0 2rem;
      height: 64px;
      background: #1a1a2e;
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: 0 2px 15px rgba(0,0,0,0.4);
    }

    .navbar-brand a {
      color: white;
      text-decoration: none;
      font-size: 1.4rem;
      font-weight: bold;
      letter-spacing: 0.5px;
      transition: opacity 0.2s;
    }
    .navbar-brand a:hover { opacity: 0.85; }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 1.2rem;
    }

    .navbar-links a {
      color: #b0b8d1;
      text-decoration: none;
      font-size: 0.9rem;
      padding: 0.4rem 0;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .navbar-links a:hover {
      color: white;
    }
    .navbar-links a.active {
      color: white;
      border-bottom: 2px solid #e94560;
    }

    .cart-link { position: relative; }

    .badge {
      background: #e94560;
      color: white;
      border-radius: 50%;
      padding: 2px 6px;
      font-size: 0.65rem;
      font-weight: bold;
      margin-left: 4px;
      vertical-align: middle;
      animation: pop 0.2s ease;
    }
    @keyframes pop {
      0% { transform: scale(0.5); }
      100% { transform: scale(1); }
    }

    .profile-link {
      display: flex !important;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #e94560;
      transition: border-color 0.2s;
    }
    .nav-avatar:hover { border-color: white; }

    .nav-avatar-placeholder {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #e94560;
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: bold;
      flex-shrink: 0;
      transition: background 0.2s;
    }
    .nav-avatar-placeholder:hover { background: white; color: #e94560; }

    .admin-link {
      color: #f0a500 !important;
      font-weight: 600;
    }
    .admin-link:hover { color: #ffd166 !important; }

    .btn-logout {
      background: transparent;
      border: 1.5px solid #e94560;
      color: #e94560;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: #e94560;
      color: white;
    }

    .btn-register {
      background: #e94560;
      color: white !important;
      padding: 0.4rem 1.1rem;
      border-radius: 20px;
      border-bottom: none !important;
      font-weight: 500;
      transition: background 0.2s, transform 0.2s !important;
    }
    .btn-register:hover {
      background: #c73652 !important;
      transform: scale(1.04);
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  cart = inject(CartService);
}