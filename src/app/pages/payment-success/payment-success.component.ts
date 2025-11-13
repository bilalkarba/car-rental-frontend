import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-payment-success',
  standalone: false,
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  paymentId: string | null = null;
  payerId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  booking: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private paypalService: PaypalService
  ) {}

 ngOnInit(): void {
  this.paymentId = this.route.snapshot.queryParamMap.get('paymentId');
  this.payerId = this.route.snapshot.queryParamMap.get('PayerID');

  if (!this.paymentId || !this.payerId) {
    this.errorMessage = 'Paramètres de paiement manquants';
    this.isLoading = false;
    return;
  }

  this.paypalService.executePayment(this.paymentId, this.payerId)
    .subscribe({
      next: (res) => {
        this.booking = res.booking;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'خطأ أثناء تأكيد الدفع';
        this.isLoading = false;
      }
    });
}


  goToBookings(): void {
    this.router.navigate(['/dashboard']);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
