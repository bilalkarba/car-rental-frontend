import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PaypalService } from '../../services/paypal.service';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  standalone:false,
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
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 2000);
        },
        error: () => {
          this.errorMessage = 'Erreur lors de la confirmation du paiement';
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

  downloadReceipt(): void {
    if (!this.booking) return;

    const data = document.getElementById('receipt-content');
    if (!data) {
      console.error('Receipt element not found');
      return;
    }

    // Temporarily make it visible for capture if needed, but absolute positioning usually works
    // We might need to ensure it's rendered
    
    html2canvas(data, { scale: 2 }).then(canvas => {
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      const contentDataURL = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const position = 0;
      
      pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
      pdf.save('Recu_Paiement_DriveNow.pdf');
    });
  }

  calculateDuration(): number {
    if (!this.booking || !this.booking.startDate || !this.booking.endDate) {
      return 0;
    }
    const start = new Date(this.booking.startDate);
    const end = new Date(this.booking.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  }
}
