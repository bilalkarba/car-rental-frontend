import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: 'app-add-car',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './add-car.component.html',
  styleUrl: './add-car.component.scss'
})
export class AddCarComponent {
  carForm: FormGroup;
  isLoading = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      plateNumber: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.min(0)]],
      available: [true]
    });
  }

  triggerFileUpload() {
    document.getElementById('car-image')?.click();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.carForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('brand', this.carForm.get('brand')?.value);
      formData.append('model', this.carForm.get('model')?.value);
      formData.append('plateNumber', this.carForm.get('plateNumber')?.value);
      formData.append('pricePerDay', this.carForm.get('pricePerDay')?.value);
      formData.append('available', this.carForm.get('available')?.value);
      
      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      this.adminService.addCar(formData).subscribe({
        next: () => {
          this.router.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          console.error('Error adding car:', error);
          this.isLoading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}