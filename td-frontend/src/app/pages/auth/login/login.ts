import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <h2>Iniciar Sesión</h2>

        @if (error) {
          <div class="error-msg">{{ error }}</div>
        }

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="field">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="tu@email.com" />
          </div>
          <div class="field">
            <label>Contraseña</label>
            <input type="password" formControlName="password" placeholder="••••••" />
          </div>
          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Ingresando...' : 'Ingresar' }}
          </button>
        </form>

        <p>¿No tienes cuenta? <a routerLink="/auth/register">Regístrate</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 64px);
      padding: 2rem;
    }
    .auth-card {
      background: white;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 420px;
    }
    h2 { margin-bottom: 1.5rem; color: #1a1a2e; text-align: center; }
    .field { margin-bottom: 1.2rem; }
    label { display: block; margin-bottom: 0.4rem; color: #555; font-size: 0.9rem; }
    input {
      width: 100%;
      padding: 0.7rem 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 1rem;
      box-sizing: border-box;
    }
    input:focus { outline: none; border-color: #1a1a2e; }
    button[type=submit] {
      width: 100%;
      padding: 0.8rem;
      background: #1a1a2e;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background 0.2s;
    }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    button:hover:not(:disabled) { background: #e94560; }
    .error-msg {
      background: #ffe0e0;
      color: #c00;
      padding: 0.7rem 1rem;
      border-radius: 6px;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }
    p { text-align: center; margin-top: 1rem; color: #666; }
    a { color: #e94560; }
  `],
})
export class Login {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  error = '';
  loading = false;

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.login(this.form.value as any).subscribe({
      next: (res) => {
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        this.error = err.error?.message || 'Credenciales incorrectas';
        this.loading = false;
      },
    });
  }
}