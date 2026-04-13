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

  cinFront: File | null = null;
  cinBack: File | null = null;

  onFileSelect(event: any, type: 'cinFront' | 'cinBack'): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      if (type === 'cinFront') {
        this.cinFront = file;
      } else {
        this.cinBack = file;
      }
    }
  }

  onSubmit(): void {
    if (this.addAdminForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('email', this.addAdminForm.value.email);
    formData.append('password', this.addAdminForm.value.password);
    formData.append('name', this.addAdminForm.value.fullName);
    formData.append('nationalId', 'ADMIN-' + Date.now());
    formData.append('role', this.addAdminForm.value.role === 'superadmin' ? 'admin' : this.addAdminForm.value.role);

    if (this.cinFront) {
      formData.append('cinFront', this.cinFront);
    }
    if (this.cinBack) {
      formData.append('cinBack', this.cinBack);
    }

    this.adminService.addAdmin(formData).subscribe({
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
