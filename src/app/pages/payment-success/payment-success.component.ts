import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { PaypalService } from '../../services/paypal.service';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    // استخدام الخط الافتراضي للغة الفرنسية
    doc.setFont('helvetica');

    doc.setFontSize(20);
    doc.text('Reçu de paiement', 105, 20, { align: 'center' });

    const bookingId = this.booking._id || 'Non défini';
    const carBrand = this.booking.carId?.brand || 'Non défini';
    const carModel = this.booking.carId?.model || '';
    const startDate = this.datePipe.transform(this.booking.startDate, 'shortDate') || 'Non défini';
    const endDate = this.datePipe.transform(this.booking.endDate, 'shortDate') || 'Non défini';
    const totalAmount = this.booking.totalAmount || '0';

    doc.setFontSize(12);
    doc.text(`Numéro de réservation: ${bookingId}`, 14, 35);
    doc.text(`Voiture: ${carBrand} ${carModel}`, 14, 45);
    doc.text(`Date de début: ${startDate}`, 14, 55);
    doc.text(`Date de fin: ${endDate}`, 14, 65);
    doc.text(`Montant total: ${totalAmount} MAD`, 14, 75);

    autoTable(doc, {
      startY: 90,
      head: [['Information', 'Valeur']],
      body: [
        ['Numéro de réservation', bookingId],
        ['Voiture', `${carBrand} ${carModel}`],
        ['Date de début', startDate],
        ['Date de fin', endDate],
        ['Montant total', `${totalAmount} MAD`],
      ],
      styles: {
        font: 'helvetica',
        fontSize: 12,
        halign: 'left'
      },
      headStyles: {
        halign: 'center',
        fillColor: [63, 81, 181],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    doc.save('payment_receipt.pdf');
  }
}
