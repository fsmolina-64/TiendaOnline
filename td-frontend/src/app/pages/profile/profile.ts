import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  http = inject(HttpClient);

  successMsg = signal('');
  errorMsg = signal('');
  loading = signal(false);

  profileForm = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
    province: [''],
    city: [''],
    address: [''],
    reference: [''],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        phone: user.phone || '',
        province: user.province || '',
        city: user.city || '',
        address: user.address || '',
        reference: user.reference || '',
      });
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.loading.set(true);
    this.http.patch('http://localhost:3000/users/profile', this.profileForm.value).subscribe({
      next: (user: any) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.auth.currentUser.set(user);
        this.successMsg.set('Perfil actualizado correctamente');
        this.loading.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.errorMsg.set('Error al actualizar el perfil');
        this.loading.set(false);
      },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.loading.set(true);
    this.http.patch('http://localhost:3000/users/change-password', this.passwordForm.value).subscribe({
      next: () => {
        this.successMsg.set('Contraseña actualizada correctamente');
        this.passwordForm.reset();
        this.loading.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al cambiar la contraseña');
        this.loading.set(false);
      },
    });
  }
}