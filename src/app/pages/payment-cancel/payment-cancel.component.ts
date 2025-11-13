import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { PaypalService } from '../../services/paypal.service';

@Component({
  selector: 'app-payment-cancel',
  standalone: false,
  templateUrl: './payment-cancel.component.html',
  styleUrl: './payment-cancel.component.scss'
})
export class PaymentCancelComponent implements OnInit {
  paymentId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  cancelSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paypalService: PaypalService
  ) {}

ngOnInit(): void {
  this.paymentId = this.route.snapshot.queryParamMap.get('paymentId');

  if (!this.paymentId) {
    this.errorMessage = 'Paramètre de paiement manquant';
    this.isLoading = false;
    return;
  }

  this.paypalService.cancelPayment(this.paymentId)
    .subscribe({
      next: (res) => {
        this.cancelSuccess = true;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'خطأ أثناء إلغاء الدفع';
        this.isLoading = false;
      }
    });
}

  goToHome(): void {
    this.router.navigate(['/cars']);
  }

  // ✅ إضافة دالة retryPayment
  retryPayment(): void {
    if (!this.paymentId) {
      this.errorMessage = 'Impossible de réessayer le paiement, paymentId manquant.';
      return;
    }
    // هنا يمكن إعادة التوجيه إلى صفحة الدفع أو استدعاء خدمة لإعادة محاولة الدفع
    this.router.navigate(['/payment'], { queryParams: { paymentId: this.paymentId } });
  }
}
