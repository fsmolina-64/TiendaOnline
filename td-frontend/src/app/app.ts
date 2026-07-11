import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, LoadingComponent],
  template: `
    <app-navbar />
    <main>
      <router-outlet />
    </main>
    <app-toast />
    <app-loading />
  `,
  styles: [`
    main {
      min-height: calc(100vh - 64px);
      background: #f5f5f5;
    }
  `],
})
export class AppComponent { }