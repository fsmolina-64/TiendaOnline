import { Component, inject, OnInit } from '@angular/core';
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
        <a routerLink="/home">
          <div class="logo-wrap">
            <img src="/logo-smile.png" alt="logo" class="navbar-logo" />
          </div>
          <div class="brand-text">
            <span class="brand-name">FeliMarket</span>
            <span class="brand-tagline">Tu tienda de confianza</span>
          </div>
        </a>
      </div>

      <div class="navbar-links">
        <a routerLink="/home" routerLinkActive="active">Inicio</a>
        <a routerLink="/catalog" routerLinkActive="active">Catálogo</a>

        @if (auth.isLoggedIn()) {
          <div class="nav-divider"></div>
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
          <div class="nav-divider"></div>
          <a routerLink="/auth/login" class="btn-register" routerLinkActive="active">
            <span class="btn-dot"></span>
            Iniciar Sesión
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2.5rem;
      height: 64px;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      color: white;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      transition: background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
    }

    .navbar.scrolled {
      background: rgba(15, 23, 42, 0.95);
      box-shadow: 0 4px 32px rgba(0, 0, 0, 0.5);
      border-bottom-color: rgba(233, 69, 96, 0.15);
    }

    .navbar-brand a {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: white;
    }

    .logo-wrap {
      position: relative;
      width: 36px;
      height: 36px;
    }

    .logo-wrap::after {
      content: '';
      position: absolute;
      inset: -2px;
      border-radius: 10px;
      background: linear-gradient(135deg, #e82f4eff, #2e3e56ff);
      z-index: -1;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .navbar-brand a:hover .logo-wrap::after { opacity: 1; }

    .navbar-logo {
      width: 36px;
      height: 36px;
      object-fit: contain;
      border-radius: 8px;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .navbar-brand a:hover .navbar-logo {
      transform: rotate(-8deg) scale(1.1);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }

    .brand-name {
      font-size: 1.1rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: -0.3px;
    }

    .brand-tagline {
      font-size: 0.62rem;
      color: rgba(255, 255, 255, 0.35);
      font-weight: 400;
      letter-spacing: 0.6px;
      margin-top: 2px;
    }

    .navbar-links {
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .navbar-links a {
      position: relative;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.45rem 0.9rem;
      border-radius: 8px;
      transition: color 0.2s ease, background 0.2s ease;
      white-space: nowrap;
    }

    .navbar-links a::after {
      content: '';
      position: absolute;
      bottom: 4px;
      left: 50%;
      width: 0;
      height: 2px;
      background: #e94560;
      border-radius: 2px;
      transform: translateX(-50%);
      transition: width 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .navbar-links a:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.05);
    }

    .navbar-links a:hover::after,
    .navbar-links a.active::after {
      width: 55%;
    }

    .navbar-links a.active {
      color: #fff;
    }

    .nav-divider {
      width: 1px;
      height: 20px;
      background: rgba(255, 255, 255, 0.08);
      margin: 0 0.5rem;
      flex-shrink: 0;
    }

    .cart-link { position: relative; }

    .badge {
      background: #e94560;
      color: white;
      border-radius: 20px;
      padding: 1px 7px;
      font-size: 0.65rem;
      font-weight: 700;
      margin-left: 4px;
      vertical-align: middle;
      animation: pop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    @keyframes pop {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }

    .profile-link {
      display: flex !important;
      align-items: center;
      gap: 6px;
    }

    .nav-avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid rgba(233, 69, 96, 0.6);
      transition: border-color 0.2s, transform 0.2s;
    }

    .nav-avatar:hover {
      border-color: #e94560;
      transform: scale(1.08);
    }

    .nav-avatar-placeholder {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #e94560, #3b82f6);
      color: white;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      flex-shrink: 0;
      transition: transform 0.2s;
    }

    .nav-avatar-placeholder:hover { transform: scale(1.08); }

    .admin-link { color: #f0a500 !important; font-weight: 600; }
    .admin-link:hover { color: #ffd166 !important; }

    .btn-logout {
      background: transparent;
      border: 1px solid rgba(233, 69, 96, 0.35);
      color: rgba(233, 69, 96, 0.85);
      padding: 0.38rem 1rem;
      border-radius: 20px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn-logout:hover {
      background: #e94560;
      border-color: #e94560;
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(233, 69, 96, 0.3);
    }

    .btn-register {
      display: flex;
      align-items: center;
      gap: 7px;
      background: linear-gradient(135deg, #e94560, #c73652);
      color: white !important;
      padding: 0.44rem 1.25rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      border-bottom: none !important;
      transition: all 0.25s ease;
      box-shadow: 0 2px 14px rgba(233, 69, 96, 0.2);
      white-space: nowrap;
    }

    .btn-register::after { display: none !important; }

    .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 22px rgba(233, 69, 96, 0.35);
      background: linear-gradient(135deg, #f05070, #e94560);
    }

    .btn-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.65);
      animation: pulse-dot 2s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes pulse-dot {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.4); }
    }
  `]
})
export class NavbarComponent implements OnInit {
  auth = inject(AuthService);
  cart = inject(CartService);

  ngOnInit() {
    window.addEventListener('scroll', () => {
      const navbar = document.querySelector('.navbar');
      navbar?.classList.toggle('scrolled', window.scrollY > 20);
    });
  }
}