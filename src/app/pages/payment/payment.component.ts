import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PaypalService } from '../../services/paypal.service';
import { DatePipe } from '@angular/common';

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
    private paypalService: PaypalService,
    private datePipe: DatePipe
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

    // البيانات التي ترسل إلى backend → /payments/create
    const paymentPayload = {
      carId: this.bookingData.carId,
      startDate: this.bookingData.startDate,
      endDate: this.bookingData.endDate,
      amount: this.bookingData.totalAmount,
      return_url: `${window.location.origin}/dashboard`,
      cancel_url: `${window.location.origin}/payment-cancel`
    };

    console.log("Sending payment payload:", paymentPayload);

    this.paypalService.createPayment(paymentPayload).subscribe({
      next: (res) => {
        console.log('Payment created successfully:', res);

        if (!res.approval_url) {
          this.errorMessage = "⚠️ خطأ: لم يتم العثور على رابط PayPal";
          this.loading = false;
          return;
        }

        // إعادة التوجيه إلى PayPal
        window.location.href = res.approval_url;
      },
      error: (err) => {
        console.error('Payment error:', err);
        this.errorMessage =
          '⚠️ خطأ أثناء إنشاء الدفع: ' +
          (err.error?.error || err.message || 'خطأ غير معروف');
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/cars']);
  }
}
