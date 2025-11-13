import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-car-details',
  standalone: false,
  templateUrl: './car-details.component.html',
  styleUrls: ['./car-details.component.scss'],
})
export class CarDetailsComponent implements OnInit {
  car: any;
  startDate!: string;
  endDate!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private bookingService: BookingService,
    private authService: AuthService,
    private paypalService: PaypalService
  ) {}

  ngOnInit() {
    const carId = this.route.snapshot.paramMap.get('id');
    if (carId) {
      this.carService.getCarById(carId).subscribe({
        next: (res) => (this.car = res),
        error: (err) => console.error(err),
      });
    }
  }

  rentCar() {
    if (!this.startDate || !this.endDate) {
      alert('⚠️ المرجو اختيار تاريخ البداية والنهاية');
      return;
    }

    const user = this.authService.getUser();
    if (!user) {
      alert('⚠️ يجب تسجيل الدخول أولاً');
      return;
    }

    const days = this.getDaysDiff(this.startDate, this.endDate);
    const totalPrice = days * this.car.pricePerDay;

    const bookingData = {
      carId: this.car._id,
      userId: user.id,
      startDate: new Date(this.startDate).toISOString(),
      endDate: new Date(this.endDate).toISOString(),
      totalAmount: totalPrice,
    };

    // ✅ الانتقال إلى صفحة الدفع
    this.router.navigate(['/payment'], {
      state: { car: this.car, bookingData },
    });
  }

  getDaysDiff(start: string, end: string): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
