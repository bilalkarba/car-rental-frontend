import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CarService } from '../../services/car.service';
import { AgencyService } from '../../services/agency.service';
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
  agencyInfo: any = {
    name: '',
    location: '',
    phone: '',
    email: ''
  };

  constructor(
    private carService: CarService,
    private agencyService: AgencyService,
    private authService: AuthService,
    public translationService: TranslationService,
    private router: Router,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

 ngOnInit() {
  this.user = this.authService.getUser();
  if (!this.user) {
    this.router.navigate(['/login']);
  } else {
    this.loadUserBookings();
    this.loadAgencyInfo();
  }
}

loadAgencyInfo() {
  if (this.user?.agencyId) {
    this.agencyService.getAgencyById(this.user.agencyId).subscribe({
      next: (agency) => {
        this.mapAgencyInfo(agency);
      },
      error: (err) => {
        console.log('Agency info not available, using defaults:', err);
      }
    });
  } else {
    // Charger la première agence par défaut si l'utilisateur n'a pas d'agencyId
    this.agencyService.getAllAgencies().subscribe({
      next: (agencies) => {
        if (agencies && agencies.length > 0) {
          this.mapAgencyInfo(agencies[0]);
        }
      },
      error: (err) => {
        console.log('No agencies found, using defaults:', err);
      }
    });
  }
}

private mapAgencyInfo(agency: any): void {
  console.log('Raw Agency Data:', agency); // Voir les données brutes
  
  this.agencyInfo = {
    name: agency.name || 'N/A',
    location: (agency.location || agency.address || 'N/A'),
    phone: (agency.phone || agency.contactPhone || 'N/A'),
    email: (agency.email || agency.contactEmail || 'N/A')
  };
  
  console.log('Mapped Agency Info:', this.agencyInfo); // Voir les données mappées
  
  // Forcer Angular à détecter les changements
  this.cdr.detectChanges();
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

        // Log des données du car pour voir si agencyId est présent
        if (booking.car) {
          console.log('Car data:', booking.car);
          console.log('Car agencyId:', booking.car.agencyId);
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

    // D'abord, vérifier si les données de l'agence sont déjà dans le booking
    if (booking.car?.agencyId) {
      console.log('Agency data from booking:', booking.car.agencyId);
      
      // Si agencyId est un objet complet avec les données
      if (typeof booking.car.agencyId === 'object' && booking.car.agencyId.name) {
        this.mapAgencyInfo(booking.car.agencyId);
        this.generatePDFAndSendEmail(booking);
      } else {
        // Si agencyId est juste un ID, essayer de charger via l'API
        const agencyId = booking.car.agencyId._id || booking.car.agencyId;
        this.agencyService.getAgencyById(agencyId).subscribe({
          next: (agency) => {
            this.mapAgencyInfo(agency);
            this.generatePDFAndSendEmail(booking);
          },
          error: (err) => {
            console.log('Error loading agency via API (403), using car data:', err);
            // Fallback: utiliser les données disponibles dans car.agencyId
            if (typeof booking.car.agencyId === 'object') {
              this.mapAgencyInfo(booking.car.agencyId);
            }
            this.generatePDFAndSendEmail(booking);
          }
        });
      }
    } else {
      // Si pas d'agencyId, générer le PDF avec les infos actuelles
      console.log('No agencyId found in booking');
      this.generatePDFAndSendEmail(booking);
    }
  }

  generatePDFAndSendEmail(booking: any) {
    // Générer le PDF d'abord
    this.generatePDF();
    
    // Ensuite envoyer l'email de reçu
    if (booking._id) {
      this.bookingService.sendReceiptEmail(booking._id).subscribe({
        next: (response) => {
          console.log('✅ Email de reçu envoyé:', response);
        },
        error: (err) => {
          console.warn('⚠️ Erreur lors de l\'envoi de l\'email:', err);
          // Ne pas bloquer l'utilisateur même si l'email échoue
        }
      });
    }
  }

  generatePDF() {
    // Mettre à jour selectedBooking et forcer la détection de changement
    this.cdr.detectChanges();
    
    // Attendre plus longtemps pour que la vue soit vraiment mise à jour
    setTimeout(() => {
      const data = document.getElementById('dashboard-receipt-content');
      if (!data) {
        console.error('Receipt element not found');
        return;
      }
      
      console.log('Receipt Content HTML:', data.innerHTML.substring(0, 200)); // Déboguer le contenu
      
      html2canvas(data, { scale: 2 }).then(canvas => {
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        const contentDataURL = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const position = 0;
        
        pdf.addImage(contentDataURL, 'PNG', 0, position, imgWidth, imgHeight);
        pdf.save(`Recu_Paiement_${this.selectedBooking.car.brand}_${this.selectedBooking.car.model}.pdf`);
        
        // Clear selected booking after download
        this.selectedBooking = null;
        this.cdr.detectChanges();
      });
    }, 300); // Augmenté de 100 à 300ms
  }
}
