import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';

type Tab = 'personal' | 'seguridad' | 'direcciones';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPass = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return newPass && confirm && newPass !== confirm ? { mismatch: true } : null;
}

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

  activeTab = signal<Tab>('personal');
  successMsg = signal('');
  errorMsg = signal('');
  loading = signal(false);
  avatarPreview = signal<string | null>(null);
  selectedAvatarFile: File | null = null;
  showDeleteConfirm = signal(false);

  personalForm = this.fb.group({
    name: ['', Validators.required],
    phone: [''],
  });

  addressForm = this.fb.group({
    province: [''],
    city: [''],
    address: [''],
    reference: [''],
  });

  passwordForm = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordMatchValidator }
  );

  deleteForm = this.fb.group({
    password: ['', Validators.required],
  });

  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.personalForm.patchValue({ name: user.name, phone: user.phone || '' });
      this.addressForm.patchValue({
        province: user.province || '',
        city: user.city || '',
        address: user.address || '',
        reference: user.reference || '',
      });
    }
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.successMsg.set('');
    this.errorMsg.set('');
  }

  onAvatarSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedAvatarFile = file;
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
        this.auth.updateUser(user);
        this.selectedAvatarFile = null;
        this.avatarPreview.set(null);
        this.notify('success', 'Foto actualizada');
      },
      error: () => this.notify('error', 'Error al subir la foto'),
    });
  }

  savePersonal() {
    if (this.personalForm.invalid) return;
    this.loading.set(true);
    this.http.patch<User>('http://localhost:3000/users/profile', this.personalForm.value).subscribe({
      next: (user) => {
        this.auth.updateUser(user);
        this.loading.set(false);
        this.notify('success', 'Información actualizada');
      },
      error: () => { this.loading.set(false); this.notify('error', 'Error al guardar'); },
    });
  }

  saveAddress() {
    this.loading.set(true);
    this.http.patch<User>('http://localhost:3000/users/profile', this.addressForm.value).subscribe({
      next: (user) => {
        this.auth.updateUser(user);
        this.loading.set(false);
        this.notify('success', 'Dirección guardada');
      },
      error: () => { this.loading.set(false); this.notify('error', 'Error al guardar'); },
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.loading.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.http.patch('http://localhost:3000/users/change-password', { currentPassword, newPassword }).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.loading.set(false);
        this.notify('success', 'Contraseña actualizada');
      },
      error: (err) => {
        this.loading.set(false);
        this.notify('error', err.error?.message || 'Contraseña actual incorrecta');
      },
    });
  }

  deleteAccount() {
    if (this.deleteForm.invalid) return;
    this.loading.set(true);
    this.http.delete('http://localhost:3000/users/me', {
      body: { password: this.deleteForm.value.password },
    }).subscribe({
      next: () => {
        this.auth.logout();
      },
      error: (err) => {
        this.loading.set(false);
        this.notify('error', err.error?.message || 'Contraseña incorrecta');
      },
    });
  }

  private notify(type: 'success' | 'error', msg: string) {
    type === 'success' ? this.successMsg.set(msg) : this.errorMsg.set(msg);
    setTimeout(() => { this.successMsg.set(''); this.errorMsg.set(''); }, 3000);
  }

  get currentEmail() { return this.auth.currentUser()?.email || ''; }
  get currentName() { return this.auth.currentUser()?.name || ''; }
  get avatarInitial() { return this.currentName.charAt(0).toUpperCase(); }
  get currentAvatar() { return this.auth.currentUser()?.avatar; }
  get passwordMismatch() { return this.passwordForm.hasError('mismatch') && this.passwordForm.get('confirmPassword')?.dirty; }
}