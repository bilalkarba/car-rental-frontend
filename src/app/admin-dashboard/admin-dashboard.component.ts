import { Component, OnInit } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from "../pipes/translate.pipe";

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
  standalone: true,
  imports: [DatePipe, CommonModule, TranslatePipe]
})

export class AdminDashboardComponent implements OnInit {

  cars: any[] = [];
  bookings: any[] = [];
  loading = true;

  constructor(private adminService: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.adminService.getAllCars().subscribe({
      next: (res) => this.cars = res,
      error: (err) => console.error(err)
    });

    this.adminService.getAllBookings().subscribe({
      next: (res) => this.bookings = res,
      error: (err) => console.error(err),
      complete: () => this.loading = false
    });
  }

  deleteCar(id: string) {
    if (confirm('هل تريد حذف هذه السيارة؟')) {
      this.adminService.deleteCar(id).subscribe({
        next: () => {
          this.cars = this.cars.filter(c => c._id !== id);
        },
        error: (err) => console.error(err)
      });
    }
  }

  editCar(carId: string) {
    this.router.navigate([`/edit-car/${carId}`]);
  }

  navigateToAddCar() {
    this.router.navigate(['/add-car']);
  }

  toggleAvailability(car: any) {
    this.adminService.updateCarAvailability(car._id, !car.available).subscribe({
      next: () => {
        car.available = !car.available;
        car.isBooked = !car.available;
      },
      error: (err) => console.error(err)
    });
  }
}
