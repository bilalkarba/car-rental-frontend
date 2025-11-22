import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.new.html',
  standalone: true,
  styleUrls: ['./add-admin.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  
})
export class AddAdminComponent implements OnInit {
  addAdminForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router
  ) {
    this.addAdminForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      fullName: ['', Validators.required],
      role: ['admin', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if current user is an admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { 'passwordMismatch': true };
  }

  onSubmit(): void {
    if (this.addAdminForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const adminData = {
      email: this.addAdminForm.value.email,
      password: this.addAdminForm.value.password,
      name: this.addAdminForm.value.fullName,
      nationalId: 'ADMIN-' + Date.now(), // Generate unique ID for admin
      role: this.addAdminForm.value.role === 'superadmin' ? 'admin' : this.addAdminForm.value.role
    };

    this.adminService.addAdmin(adminData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.router.navigate(['/admin-dashboard']);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to add admin. Please try again.';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/admin-dashboard']);
  }
}
