import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe]
})

export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  cinFrontFile: File | null = null;
  cinBackFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      nationalId: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  passwordMatchValidator(form: FormGroup) {
    return form.controls['password'].value === form.controls['confirmPassword'].value
      ? null : { mismatch: true };
  }

  onFileSelected(event: any, type: 'front' | 'back') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'front') {
        this.cinFrontFile = file;
      } else {
        this.cinBackFile = file;
      }
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    if (!this.cinFrontFile || !this.cinBackFile) {
      this.error = 'Please upload both front and back images of your National ID.';
      return;
    }

    this.isLoading = true;
    this.error = null;

    const formData = new FormData();
    formData.append('name', this.registerForm.get('name')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('nationalId', this.registerForm.get('nationalId')?.value);
    formData.append('cinFront', this.cinFrontFile);
    formData.append('cinBack', this.cinBackFile);
    
    console.log('Attempting registration with FormData');

    this.auth.register(formData).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Registration error:', error);
        if (error.error) {
          this.error = error.error.message || error.error.msg || error.error.error || 'Registration failed.';
        } else {
          this.error = 'Server error. Please try again later.';
        }
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
