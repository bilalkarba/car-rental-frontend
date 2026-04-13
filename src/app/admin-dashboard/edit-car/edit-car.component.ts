import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-edit-car',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './edit-car.component.html',
  styleUrl: './edit-car.component.scss'
})
export class EditCarComponent implements OnInit {
  carForm: FormGroup;
  isLoading = false;
  carId: string = '';
  selectedFile: File | null = null;
  imagePreview: string | ArrayBuffer | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute,
    public translationService: TranslationService
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      plateNumber: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.min(0)]],
      available: [true],
      fuel: ['', Validators.required],
      type: ['', Validators.required]
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carId = id;
      this.loadCar();
    } else {
      this.router.navigate(['/admin-dashboard']);
    }
  }

  loadCar() {
    this.adminService.getCarById(this.carId).subscribe({
      next: (car) => {
        if (car) {
          this.carForm.patchValue(car);
          if (car.image) {
            this.imagePreview = car.image;
          }
        }
      },
      error: (error) => {
        console.error('Error loading car:', error);
        this.router.navigate(['/admin-dashboard']);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
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
      
      // Append all form fields
      Object.keys(this.carForm.controls).forEach(key => {
        const value = this.carForm.get(key)?.value;
        formData.append(key, value);
      });

      // Append image if selected
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      this.adminService.updateCar(this.carId, formData).subscribe({
        next: () => {
          this.router.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          console.error('Error updating car:', error);
          this.isLoading = false;
          
          // Show user-friendly error message
          if (error?.error?.message) {
            alert(this.translationService.translate('errorPrefix') + ' ' + error.error.message);
          } else {
            alert(this.translationService.translate('updateCarError') || 'An error occurred while updating the car. Please try again.');
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