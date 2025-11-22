import { Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  userBookings: any[] = [];
  isLoading: boolean = true;
  user: any;

  constructor(
    private carService: CarService,
    private authService: AuthService,
    public translationService: TranslationService,
    private router: Router,
    private bookingService: BookingService
  ) {}

 ngOnInit() {
  this.user = this.authService.getUser();
  if (!this.user) {
    this.router.navigate(['/login']);
  } else {
    this.loadUserBookings();
  }
}

loadUserBookings() {
  this.isLoading = true;

  this.bookingService.getUserBookings().subscribe({
    next: (bookings) => {
      console.log('User bookings:', bookings);
      // معالجة البيانات لضمان وجود كائن car لكل حجز
      this.userBookings = bookings.map(booking => {
        // إذا كانت بيانات السيارة تأتي عبر carId وليس car
        if (booking.carId && !booking.car) {
          booking.car = booking.carId;
        }
        return booking;
      });
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Error loading bookings:', err);
      this.isLoading = false;
    }
  });
}
  viewBookingDetails(bookingId: string) {
    this.router.navigate(['/booking-details', bookingId]);
}


  navigateToCars() {
    this.router.navigate(['/cars']);
  }
  
  // حساب مدة الإيجار بالساعات والأيام
  calculateBookingDuration(booking: any): string {
    const diffMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0 && remainingHours > 0) {
      return `${days} يوم و ${remainingHours} hour`;
    } else if (days > 0) {
      return `${days} يوم`;
    } else {
      return `${hours} ساعة`;
    }
  }
}
