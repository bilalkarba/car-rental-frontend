import { Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { TranslationService } from '../../services/translation.service';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  selectedBooking: any = null;

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

        // Check if booking is confirmed and end date is passed
        if (booking.status === 'confirmed' && new Date(booking.endDate) < new Date()) {
          booking.status = 'returned';
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
    const booking = this.userBookings.find(b => b._id === bookingId);
    if (booking && booking.car) {
      const totalPrice = this.calculateTotalPrice(booking);
      const details = `
${this.translationService.translate('bookingDetails') || 'Booking Details'}

${this.translationService.translate('bookingNumber') || 'Booking Number'}: ${booking._id}

${this.translationService.translate('car') || 'Car'}: ${booking.car.brand} ${booking.car.model}
${this.translationService.translate('plateNumber') || 'Plate'}: ${booking.car.plateNumber}

${this.translationService.translate('booking.startDate') || 'Start Date'}: ${new Date(booking.startDate).toLocaleString()}
${this.translationService.translate('booking.endDate') || 'End Date'}: ${new Date(booking.endDate).toLocaleString()}

${this.translationService.translate('booking.duration') || 'Duration'}: ${this.calculateBookingDuration(booking)}

${this.translationService.translate('booking.totalPrice') || 'Total Price'}: ${totalPrice} MAD

${this.translationService.translate('booking.status') || 'Status'}: ${booking.status}
      `;
      alert(details);
    }
  }


  navigateToCars() {
    this.router.navigate(['/cars']);
  }
  
  // Calculate total price for booking
  calculateTotalPrice(booking: any): number {
    if (!booking || !booking.car) return 0;
    const diffMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
    const days = diffMs / (1000 * 60 * 60 * 24);
    return Math.round(booking.car.pricePerDay * days);
  }
  
  // Calculate rental duration in hours and days
  calculateBookingDuration(booking: any): string {
    const diffMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    const dayText = this.translationService.translate('booking.day') || 'day';
    const daysText = this.translationService.translate('booking.days') || 'days';
    const hourText = this.translationService.translate('booking.hour') || 'hour';
    const hoursText = this.translationService.translate('booking.hours') || 'hours';
    
    if (days > 0 && remainingHours > 0) {
      return `${days} ${days === 1 ? dayText : daysText} & ${remainingHours} ${remainingHours === 1 ? hourText : hoursText}`;
    } else if (days > 0) {
      return `${days} ${days === 1 ? dayText : daysText}`;
    } else {
      return `${hours} ${hours === 1 ? hourText : hoursText}`;
    }
  }

  // Calculate rental duration in days only (for PDF receipt)
  calculateDurationInDays(booking: any): number {
    if (!booking) return 0;
    const diffMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return days;
  }

  // Download receipt for booking as PDF
  downloadReceipt(booking: any) {
    if (!booking || !booking.car) return;
    
    this.selectedBooking = booking;
    
    // Wait for view to update
    setTimeout(() => {
      const data = document.getElementById('dashboard-receipt-content');
      if (!data) {
        console.error('Receipt element not found');
        return;
      }
      
      html2canvas(data, { scale: 2 }).then(canvas => {
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const position = 0;
        
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save(`Recu_Paiement_${booking.car.brand}_${booking.car.model}.pdf`);
        
        // Clear selected booking after download
        this.selectedBooking = null;
      });
    }, 100);
  }
}
