import { Injectable, inject, signal } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from './api.service';
import { User } from '../models';

const TOKEN_KEY = 'pp_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  readonly user = signal<User | null>(null);

  get token() { return localStorage.getItem(TOKEN_KEY); }
  get isAuthed() { return !!this.token; }

  login(email: string, password: string) {
    return this.api.post<{ token: string; user: User }>('/auth/login', { email, password })
      .pipe(tap(r => this.setSession(r)));
  }
  register(email: string, password: string) {
    return this.api.post<{ token: string; user: User }>('/auth/register', { email, password })
      .pipe(tap(r => this.setSession(r)));
  }
  logout() { localStorage.removeItem(TOKEN_KEY); this.user.set(null); }

  private setSession(r: { token: string; user: User }) {
    localStorage.setItem(TOKEN_KEY, r.token);
    this.user.set(r.user);
  }
}