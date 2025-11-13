import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from "../../pipes/translate.pipe";

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

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.carForm = this.fb.group({
      brand: ['', Validators.required],
      model: ['', Validators.required],
      plateNumber: ['', Validators.required],
      pricePerDay: ['', [Validators.required, Validators.min(0)]],
      available: [true]
    });
  }

  ngOnInit() {
    this.carId = this.route.snapshot.paramMap.get('id')!;
    this.loadCar();
  }

  loadCar() {
    this.adminService.getCarById(this.carId).subscribe({
      next: (car) => {
        this.carForm.patchValue(car);
      },
      error: (error) => {
        console.error('Error loading car:', error);
        this.router.navigate(['/admin-dashboard']);
      }
    });
  }

  onSubmit() {
    if (this.carForm.valid) {
      this.isLoading = true;
      this.adminService.updateCar(this.carId, this.carForm.value).subscribe({
        next: () => {
          this.router.navigate(['/admin-dashboard']);
        },
        error: (error) => {
          console.error('Error updating car:', error);
          this.isLoading = false;
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin-dashboard']);
  }
}