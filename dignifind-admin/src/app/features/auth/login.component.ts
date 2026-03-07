import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <div class="df-login-wrap">
      <div class="df-login-card">

        <!-- Logo -->
        <img src="assets/DigniFind.jpg" alt="DigniFind" class="df-login-logo"
             onerror="this.style.display='none'" />

        <h1 class="df-login-title">Welcome back</h1>
        <p class="df-login-sub">Sign in to the DigniFind Admin Portal</p>

        <!-- Email form -->
        <form [formGroup]="form" (ngSubmit)="loginWithEmail()">
          <div class="df-form-group">
            <label for="email">Email address</label>
            <input id="email" class="df-input" type="email"
                   placeholder="you@example.com" formControlName="email"
                   autocomplete="email" />
          </div>

          <div class="df-form-group">
            <label for="password">Password</label>
            <input id="password" class="df-input" type="password"
                   placeholder="••••••••" formControlName="password"
                   autocomplete="current-password" />
          </div>

          @if (error) {
            <div class="df-alert df-alert-danger" role="alert">{{ error }}</div>
          }

          <button class="df-btn df-btn-primary" type="submit"
                  style="width:100%;justify-content:center"
                  [disabled]="loading || form.invalid">
            {{ loading ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <div class="df-or">or</div>

        <!-- Google -->
        <button class="df-btn-google" (click)="loginWithGoogle()" [disabled]="loading">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  error = '';
  loading = false;

  loginWithEmail(): void {
    const { email, password } = this.form.value;
    if (!email || !password) return;
    this.loading = true;
    this.auth.signInWithEmail(email, password)
      .then(() => this.router.navigate(['/funerals']))
      .catch(e => { this.error = e.message; this.loading = false; });
  }

  loginWithGoogle(): void {
    this.loading = true;
    this.auth.signInWithGoogle()
      .then(() => this.router.navigate(['/funerals']))
      .catch(e => { this.error = e.message; this.loading = false; });
  }
}
