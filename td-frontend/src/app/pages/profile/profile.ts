import { Component, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder, Validators, ReactiveFormsModule,
  AbstractControl, ValidatorFn,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { User, Address } from '../../core/models';
import { ToastService } from '../../core/services/toast.service';

type Tab = 'personal' | 'seguridad' | 'direcciones';


function passwordMatchValidator(control: AbstractControl) {
  const n = control.get('newPassword')?.value;
  const c = control.get('confirmPassword')?.value;
  return n && c && n !== c ? { mismatch: true } : null;
}

function exactDigitsValidator(length: number): ValidatorFn {
  return (control: AbstractControl) => {
    const val = String(control.value ?? '').trim();
    if (!val) return null;
    if (!/^\d+$/.test(val)) return { onlyNumbers: true };
    if (val.length !== length) return { exactLength: { required: length, actual: val.length } };
    return null;
  };
}

function maxDigitsValidator(maxLength: number): ValidatorFn {
  return (control: AbstractControl) => {
    const val = String(control.value ?? '').trim();
    if (!val) return null;
    if (!/^\d+$/.test(val)) return { onlyNumbers: true };
    if (val.length > maxLength) return { tooLong: true };
    return null;
  };
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
  toastService = inject(ToastService);

  activeTab = signal<Tab>('personal');
  loading = signal(false);
  avatarPreview = signal<string | null>(null);
  selectedAvatarFile: File | null = null;
  showDeleteConfirm = signal(false);
  showAddressForm = signal(false);
  editingAddressId = signal<string | null>(null);
  addresses = signal<Address[]>([]);

  showCurrentPwd = signal(false);
  showNewPwd = signal(false);
  showConfirmPwd = signal(false);
  showDeletePwd = signal(false);


  personalForm = this.fb.group({
    name: ['', Validators.required],
    phone: ['', [maxDigitsValidator(10)]],
    cedula: ['', [exactDigitsValidator(10)]],
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

  addressForm = this.fb.group({
    label: ['Casa', Validators.required],
    province: ['', Validators.required],
    city: ['', Validators.required],
    address: ['', Validators.required],
    reference: [''],
    postalCode: ['', [maxDigitsValidator(6)]],
    isDefault: [false],
  });


  ngOnInit() {
    const user = this.auth.currentUser();
    if (user) {
      this.personalForm.patchValue({
        name: user.name,
        phone: user.phone || '',
        cedula: user.cedula || '',
      });
    }
    this.loadAddresses();
  }


  setTab(tab: Tab) { this.activeTab.set(tab); }


  loadAddresses() {
    this.http.get<Address[]>('http://localhost:3000/users/addresses').subscribe({
      next: (list) => this.addresses.set(list),
    });
  }

  openNewAddress() {
    this.editingAddressId.set(null);
    this.addressForm.reset({ label: 'Casa', isDefault: false });
    this.showAddressForm.set(true);
  }

  editAddress(addr: Address) {
    this.editingAddressId.set(addr.id);
    this.addressForm.patchValue({
      label: addr.label,
      province: addr.province,
      city: addr.city,
      address: addr.address,
      reference: addr.reference || '',
      postalCode: addr.postalCode || '',
      isDefault: addr.isDefault,
    });
    this.showAddressForm.set(true);
  }

  saveAddress() {
    if (this.addressForm.invalid) return;
    this.loading.set(true);
    const id = this.editingAddressId();
    const req = id
      ? this.http.patch<Address>(`http://localhost:3000/users/addresses/${id}`, this.addressForm.value)
      : this.http.post<Address>('http://localhost:3000/users/addresses', this.addressForm.value);
    req.subscribe({
      next: () => {
        this.loadAddresses();
        this.showAddressForm.set(false);
        this.loading.set(false);
        this.notify('success', id ? 'Dirección actualizada' : 'Dirección agregada');
      },
      error: () => { this.loading.set(false); this.notify('error', 'Error al guardar dirección'); },
    });
  }

  setDefault(id: string) {
    this.http.patch(`http://localhost:3000/users/addresses/${id}/default`, {}).subscribe({
      next: () => { this.loadAddresses(); this.toastService.success('Dirección predeterminada actualizada'); },
      error: () => this.toastService.error('Error al actualizar dirección'),
    });
  }

  deleteAddress(id: string) {
    this.http.delete(`http://localhost:3000/users/addresses/${id}`).subscribe({
      next: () => { this.loadAddresses(); this.toastService.success('Dirección eliminada'); },
      error: () => this.toastService.error('Error al eliminar dirección'),
    });
  }


  onAvatarSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
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
      next: () => this.auth.logout(),
      error: (err) => {
        this.loading.set(false);
        this.notify('error', err.error?.message || 'Contraseña incorrecta');
      },
    });
  }

  blockNonNumeric(event: KeyboardEvent) {
    const allowed = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End',
    ];
    if (allowed.includes(event.key)) return;
    if (event.ctrlKey || event.metaKey) return; // Ctrl+A/C/V/X
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  enforceMaxLength(event: Event, control: AbstractControl | null, maxLen: number) {
    if (!control) return;
    const input = event.target as HTMLInputElement;
    const filtered = input.value.replace(/\D/g, '').slice(0, maxLen);
    if (input.value !== filtered) {
      input.value = filtered;
      control.setValue(filtered, { emitEvent: false });
      control.markAsDirty();
    }
  }

  handleNumericPaste(event: ClipboardEvent, control: AbstractControl | null, maxLen: number) {
    event.preventDefault();
    if (!control) return;
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '').slice(0, maxLen);
    control.setValue(pasted);
    control.markAsDirty();
  }

  private notify(type: 'success' | 'error', msg: string) {
    type === 'success' ? this.toastService.success(msg) : this.toastService.error(msg);
  }

  get currentEmail() { return this.auth.currentUser()?.email || ''; }
  get currentName() { return this.auth.currentUser()?.name || ''; }
  get avatarInitial() { return this.currentName.charAt(0).toUpperCase(); }
  get currentAvatar() { return this.auth.currentUser()?.avatar; }
  get passwordMismatch() {
    return this.passwordForm.hasError('mismatch') && this.passwordForm.get('confirmPassword')?.dirty;
  }
}