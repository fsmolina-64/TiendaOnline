import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  usersService = inject(UsersService);
  toastService = inject(ToastService);

  users = signal<any[]>([]);
  selectedUser = signal<any | null>(null);
  loading = signal(true);
  loadingDetail = signal(false);
  search = '';
  showInactive = false;

  getImageUrl(url: string): string {
    if (!url) return '';
    return url.startsWith('http') ? url : environment.apiUrl + url;
  }

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.usersService.getAllAdmin(
      this.search || undefined,
      this.showInactive
    ).subscribe({
      next: (users: any[]) => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSearch() {
    clearTimeout((this as any)._searchTimer);
    (this as any)._searchTimer = setTimeout(() => this.loadUsers(), 400);
  }

  toggleInactive() {
    this.showInactive = !this.showInactive;
    this.loadUsers();
  }

  selectUser(id: string) {
    this.loadingDetail.set(true);
    this.usersService.getOneAdmin(id).subscribe({
      next: (user: any) => { this.selectedUser.set(user); this.loadingDetail.set(false); },
      error: () => this.loadingDetail.set(false),
    });
  }

  closeDetail() { this.selectedUser.set(null); }

  toggle(user: any) {
    this.usersService.toggleUser(user.id).subscribe({
      next: () => {
        this.toastService.success(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
        this.loadUsers();
        if (this.selectedUser()?.id === user.id) this.selectUser(user.id);
      },
      error: () => this.toastService.error('Error al cambiar estado del usuario'),
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      DELIVERED: 'Entregado',
      CANCELLED: 'Cancelado',
    };
    return labels[status] || status;
  }
}