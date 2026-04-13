import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CarService } from '../../services/car.service';
import { BookingService } from '../../services/booking.service';
import { AuthService } from '../../services/auth.service';
import { PaypalService } from '../../services/paypal.service';
import { TranslationService } from '../../services/translation.service';

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
  currentImage: string | null = null;

  carBookings: any[] = [];
  isCarAvailable: boolean = true;
  isCurrentlyAvailable: boolean = true;
  nextAvailableDate: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private carService: CarService,
    private bookingService: BookingService,
    private authService: AuthService,
    private paypalService: PaypalService,
    public translationService: TranslationService
  ) {}

  ngOnInit() {
    const carId = this.route.snapshot.paramMap.get('id');

    if (carId) {
      this.carService.getCarById(carId).subscribe({
        next: (res) => {
          this.car = res;
          this.isCurrentlyAvailable = this.car.available;
          this.checkCarAvailability(carId);
        },
        error: (err) => console.error(err),
      });
    }
  }

  // ===============================
  //      CHECK CAR AVAILABILITY
  // ===============================
  checkCarAvailability(carId: string) {
    this.bookingService.getBookingsByCarId(carId).subscribe({
      next: (bookings) => {
        this.carBookings = bookings;
        this.checkDatesOverlap();
      },
      error: (err) => {
        console.error('Error fetching bookings:', err);
        this.carBookings = [];
        this.checkDatesOverlap();
      },
    });
  }

  // ===============================
  //          DATES OVERLAP
  // ===============================
  checkDatesOverlap() {
    if (!this.startDate || !this.endDate) {
      this.isCurrentlyAvailable = this.car.available;
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    this.isCarAvailable = true;
    this.isCurrentlyAvailable = this.car.available;
    this.nextAvailableDate = null;

    for (const booking of this.carBookings) {
      const bStart = new Date(booking.startDate);
      const bEnd = new Date(booking.endDate);

      const overlap = start <= bEnd && end >= bStart;

      if (overlap) {
        this.isCarAvailable = false;
        this.isCurrentlyAvailable = false;

        this.nextAvailableDate = new Date(bEnd.getTime() + 86400000)
          .toISOString()
          .split('T')[0];

        break;
      }
    }
  }

  // ===============================
  //           RENT CAR
  // ===============================
  rentCar() {
    if (!this.startDate || !this.endDate) {
      alert('⚠️ ' + this.translationService.translate('car.selectDates'));
      return;
    }

    this.checkDatesOverlap();

    if (!this.isCarAvailable || !this.isCurrentlyAvailable) {
      let message = '⚠️ ' + this.translationService.translate('carStatus.booked');

      const latestEnd = this.getLastBookingEndDate();

      if (latestEnd) {
        const available = new Date(latestEnd.getTime() + 86400000);
        const formatted = available.toLocaleDateString(
          this.translationService.getCurrentLanguage() === 'ar'
            ? 'ar-MA'
            : this.translationService.getCurrentLanguage() === 'fr'
            ? 'fr-FR'
            : 'en-US'
        );

        message += '\n\n📅 ' + this.translationService.translate('carStatus.availableAfter') + ': ' + formatted;
      }

      alert(message);
      return;
    }

    const user = this.authService.getUser();

    if (!user) {
      alert('⚠️ ' + this.translationService.translate('login.error'));
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

    this.router.navigate(['/payment'], {
      state: { car: this.car, bookingData },
    });
  }

  // ===============================
  //       CALCULATE DAYS DIFF
  // ===============================
  getDaysDiff(start: string, end: string): number {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / 86400000);
  }
  
  // ===============================
  //    CALCULATE RENTAL DAYS
  // ===============================
  calculateRentalDays(): number {
    if (!this.startDate || !this.endDate) return 0;
    return this.getDaysDiff(this.startDate, this.endDate);
  }
  
  // ===============================
  //    CALCULATE TOTAL PRICE
  // ===============================
  calculateTotalPrice(): number {
    if (!this.startDate || !this.endDate) return 0;
    const days = this.calculateRentalDays();
    return days * this.car.pricePerDay;
  }
  
  // ===============================
  //     GET ALL IMAGES
  // ===============================
  getAllImages(): string[] {
    if (!this.car) return [];
    const images = [this.car.image];
    if (this.car.additionalImages && this.car.additionalImages.length > 0) {
      images.push(...this.car.additionalImages);
    }
    return images;
  }

  // ===============================
  //   GET LAST BOOKING END DATE
  // ===============================
  getLastBookingEndDate(): Date | null {
    if (this.carBookings.length === 0) return null;

    let lastDate: Date | null = null;

    for (const booking of this.carBookings) {
      const d = new Date(booking.endDate);
      if (!lastDate || d > lastDate) lastDate = d;
    }

    return lastDate;
  }

  // ===============================
  // FORMAT NEXT AVAILABLE DATE
  // ===============================
  getFormattedAvailableDate(): string {
    const last = this.getLastBookingEndDate();
    if (!last) return '';

    const available = new Date(last.getTime() + 86400000);

    return available.toLocaleDateString(
      this.translationService.getCurrentLanguage() === 'ar'
        ? 'ar-MA'
        : this.translationService.getCurrentLanguage() === 'fr'
        ? 'fr-FR'
        : 'en-US'
    );
  }
}
