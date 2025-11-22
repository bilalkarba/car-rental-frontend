import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { TranslationService } from '../../services/translation.service';

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
    private router: Router,
    public translationService: TranslationService
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      plateNumber: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.min(0)]],
      available: [true],
      // ➕ الحقول الجديدة
  fuel: ['', Validators.required],
  type: ['', Validators.required]
    });
  }

  triggerFileUpload() {
    document.getElementById('car-image')?.click();
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check file type
      if (!file.type.match(/image\/*/)) {
        alert('Please select a valid image file.');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should not exceed 5MB.');
        return;
      }
      
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    // Mark all fields as touched to trigger validation
    Object.keys(this.carForm.controls).forEach(key => {
      this.carForm.get(key)?.markAsTouched();
    });
    
    if (this.carForm.valid) {
      this.isLoading = true;
      const formData = new FormData();
      formData.append('brand', this.carForm.get('brand')?.value);
      formData.append('model', this.carForm.get('model')?.value);
      formData.append('plateNumber', this.carForm.get('plateNumber')?.value);
      formData.append('pricePerDay', this.carForm.get('pricePerDay')?.value);
      formData.append('available', this.carForm.get('available')?.value);
      formData.append('fuel', this.carForm.get('fuel')?.value);
      formData.append('type', this.carForm.get('type')?.value);
      
      // Always append image, even if it's null (server will handle default image)
      if (this.selectedImage) {
        formData.append('image', this.selectedImage, this.selectedImage.name);
      } else {
        // Add a flag to indicate no image was selected
        formData.append('noImage', 'true');
      }

      this.adminService.addCar(formData).subscribe({
        next: () => {
          this.router.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          console.error('Error adding car:', error);
          this.isLoading = false;
          
          // Show user-friendly error message
          if (error.error && error.error.message) {
            alert(this.translationService.translate('errorPrefix') + ' ' + error.error.message);
          } else {
            alert(this.translationService.translate('addCarError'));
          }
        }
      });
    } else {
      // Form is invalid, show a general message
      alert(this.translationService.translate('fillAllFields'));
    }
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}