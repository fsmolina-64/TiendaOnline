import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl:'./register.html',
  styleUrls: ['./register.css']
})
export class Register {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  error = '';
  loading = false;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    this.auth.register(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/home']),
      error: (err) => {
        this.error = err.error?.message || 'Error al crear la cuenta';
        this.loading = false;
      },
    });
  }
}