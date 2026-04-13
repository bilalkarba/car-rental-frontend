import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  isRTL: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  showPassword = false;

  ngOnInit(): void {
    this.updateRTL();
  }

  updateRTL(): void {
    this.isRTL = this.document.documentElement.dir === 'rtl';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = null;

    const { email, password } = this.loginForm.value;
    
    console.log('Attempting login with:', { email, password });
    console.log('Form valid:', this.loginForm.valid);

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        console.log('User role:', response.user.role);
        
        // Store user data with role
        localStorage.setItem('user_role', response.user.role);
        
        // Navigate based on role
        // Navigate based on role
        if (response.user.role === 'superadmin' || response.user.role === 'super admin') {
          this.router.navigate(['/super-admin-dashboard']);
        } else if (response.user.role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        if (error.error) {
          console.error('Error details:', error.error);
        }
        this.error = error.error?.msg || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك والمحاولة مرة أخرى';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
