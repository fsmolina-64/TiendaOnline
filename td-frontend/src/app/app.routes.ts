import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./pages/auth/login/login').then((m) => m.Login),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./pages/auth/register/register').then((m) => m.Register),
      },
    ],
  },

  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./pages/catalog/catalog').then((m) => m.Catalog),
  },
  {
    path: 'products/:slug',
    loadComponent: () =>
      import('./pages/product-detail/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/cart/cart').then((m) => m.Cart),
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders/orders').then((m) => m.Orders),
  },
  {
    path: 'orders/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/orders/order-detail/order-detail').then((m) => m.OrderDetail),
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/favorites/favorites').then((m) => m.Favorites),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/profile/profile').then((m) => m.Profile),
  },

  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./admin/products/products').then((m) => m.Products),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./admin/categories/categories').then((m) => m.Categories),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./admin/orders/orders').then((m) => m.Orders),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./admin/stock/stock').then((m) => m.Stock),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./admin/promotions/promotions').then((m) => m.Promotions),
      },
    ],
  },

  { path: '**', redirectTo: 'home' },
];