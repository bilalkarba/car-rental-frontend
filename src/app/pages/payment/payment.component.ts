import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { CommonModule, DatePipe } from '@angular/common';
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-payment',
  standalone: false,
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {
  car: any;
  bookingData: any;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private datePipe: DatePipe,
    private paypalService: PaypalService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.car = navigation.extras.state['car'];
      this.bookingData = navigation.extras.state['bookingData'];
    } else {
      this.router.navigate(['/cars']);
    }
  }

  ngOnInit(): void {}
createBookingAndPay(): void {
  if (!this.bookingData) {
    this.errorMessage = '⚠️ بيانات الحجز غير متوفرة';
    return;
  }

  this.loading = true;
  this.errorMessage = null;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const bookingPayload = {
    ...this.bookingData,
    userId: user.id
  };

  // 1️⃣ إنشاء الحجز أولاً
  this.bookingService.createBooking(bookingPayload).subscribe({
    next: (booking: any) => {
      console.log('Booking created successfully:', booking);
      // 2️⃣ إنشاء الدفع على Backend
      const returnUrl = `http://localhost:4200/payment-success`;
      const cancelUrl = `http://localhost:4200/payment-cancel`;

      // Assurons-nous que le montant est correctement formaté
      // La réponse du backend contient booking dans un objet
      const bookingData = booking.booking || booking;
      const amount = parseFloat(bookingData.totalAmount.toString());
      // Arrondir à 2 décimales
      const formattedAmount = Math.round(amount * 100) / 100;

      console.log('Creating payment with:', {
        bookingId: bookingData._id,
        amount: formattedAmount,
        returnUrl: returnUrl,
        cancelUrl: cancelUrl
      });

      this.paypalService.createPayment(bookingData._id, formattedAmount, returnUrl, cancelUrl)
        .subscribe({
          next: (res) => {
            console.log('Payment created successfully:', res);
            // 3️⃣ إعادة التوجيه لرابط PayPal Sandbox
            window.location.href = res.approval_url;
          },
          error: (err) => {
            console.error('Payment creation error:', err);
            this.errorMessage = 'خطأ أثناء إنشاء الدفع: ' + (err.error?.error || err.message || 'خطأ غير معروف');
            this.loading = false;
          }
        });
    },
    error: (err) => {
      console.error('Booking creation error:', err);
      this.errorMessage = 'خطأ أثناء إنشاء الحجز: ' + (err.error?.error || err.message || 'خطأ غير معروف');
      this.loading = false;
    }
  });
}


  private initiatePaypalPayment(bookingId: string, amount: number): void {
    // Simuler le paiement PayPal
    this.loading = false;
    
    // Rediriger vers la page de succès après un court délai
    setTimeout(() => {
      this.router.navigate(['/payment-success'], {
        state: {
          bookingId: bookingId,
          amount: amount
        }
      });
    }, 1000);
  }

  cancel(): void {
    this.router.navigate(['/cars']);
  }
}
