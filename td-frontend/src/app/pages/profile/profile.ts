import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  http = inject(HttpClient);

  successMsg = signal('');
  errorMsg = signal('');
  loading = signal(false);
  avatarPreview = signal<string | null>(null);
  selectedAvatarFile: File | null = null;

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

  // Cuando el usuario selecciona una imagen, mostramos preview antes de subir
  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedAvatarFile = file;

    // Crear URL temporal para preview inmediato
    const reader = new FileReader();
    reader.onload = (e) => this.avatarPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  uploadAvatar() {
    if (!this.selectedAvatarFile) return;
    const formData = new FormData();
    formData.append('avatar', this.selectedAvatarFile);

    this.http.post<User>('http://localhost:3000/uploads/avatar', formData).subscribe({
      next: (user) => {
        // Actualizamos el usuario en memoria y localStorage
        this.auth.updateUser(user);
        this.selectedAvatarFile = null;
        this.avatarPreview.set(null);
        this.successMsg.set('Foto de perfil actualizada');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.errorMsg.set('Error al subir la foto');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) return;
    this.loading.set(true);
    this.http.patch<User>('http://localhost:3000/users/profile', this.profileForm.value).subscribe({
      next: (user) => {
        this.auth.updateUser(user);
        this.successMsg.set('Perfil actualizado correctamente');
        this.loading.set(false);
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: () => {
        this.errorMsg.set('Error al actualizar el perfil');
        this.loading.set(false);
        setTimeout(() => this.errorMsg.set(''), 3000);
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
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }
}