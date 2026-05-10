import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../core/models';

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categoriesService = inject(CategoriesService);
  fb = inject(FormBuilder);

  categories = signal<Category[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingId = signal<string | null>(null);
  successMsg = signal('');
  errorMsg = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.categoriesService.getAllAdmin().subscribe({
      next: (cats) => { this.categories.set(cats); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset();
    this.showForm.set(true);
  }

  openEdit(cat: Category) {
    this.editingId.set(cat.id);
    this.form.patchValue({ name: cat.name });
    this.showForm.set(true);
  }

  save() {
    if (this.form.invalid) return;
    const id = this.editingId();
    const request = id
      ? this.categoriesService.update(id, this.form.value as any)
      : this.categoriesService.create(this.form.value as any);

    request.subscribe({
      next: () => {
        this.showForm.set(false);
        this.loadCategories();
        this.successMsg.set(id ? 'Categoría actualizada' : 'Categoría creada');
        setTimeout(() => this.successMsg.set(''), 3000);
      },
      error: (err) => {
        this.errorMsg.set(err.error?.message || 'Error al guardar');
        setTimeout(() => this.errorMsg.set(''), 3000);
      },
    });
  }

  toggle(cat: Category) {
    this.categoriesService.toggle(cat.id).subscribe({
      next: () => this.loadCategories(),
    });
  }
}