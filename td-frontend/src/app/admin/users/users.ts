import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/user.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  usersService = inject(UsersService);

  users = signal<any[]>([]);
  selectedUser = signal<any | null>(null);
  loading = signal(true);
  loadingDetail = signal(false);
  search = '';
  successMsg = signal('');

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.loading.set(true);
    this.usersService.getAllAdmin(this.search || undefined).subscribe({
      next: (users) => { this.users.set(users); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  // Búsqueda con debounce manual — evita llamar al backend en cada tecla
  onSearch() {
    clearTimeout((this as any)._searchTimer);
    (this as any)._searchTimer = setTimeout(() => this.loadUsers(), 400);
  }

  selectUser(id: string) {
    this.loadingDetail.set(true);
    this.usersService.getOneAdmin(id).subscribe({
      next: (user) => { this.selectedUser.set(user); this.loadingDetail.set(false); },
      error: () => this.loadingDetail.set(false),
    });
  }

  closeDetail() { this.selectedUser.set(null); }

  toggle(user: any) {
    this.usersService.toggleUser(user.id).subscribe({
      next: () => {
        this.successMsg.set(`Usuario ${user.isActive ? 'desactivado' : 'activado'} correctamente`);
        this.loadUsers();
        if (this.selectedUser()?.id === user.id) {
          this.selectUser(user.id);
        }
        setTimeout(() => this.successMsg.set(''), 3000);
      },
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