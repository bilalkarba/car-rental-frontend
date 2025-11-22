import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

interface Notification {
  type: string;
  message: string;
  timestamp: Date;
  icon: string;
}

@Component({
  selector: 'app-dashboard-realtime',
  templateUrl: './dashboard-realtime.component.html',
  styleUrls: ['./dashboard-realtime.component.scss'],
  standalone: false
})
export class DashboardRealtimeComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscriptions: Subscription[] = [];
  stats = {
    totalCars: 0,
    activeBookings: 0,
    availableCars: 0
  };
  loading = true;
  cars: any[] = [];
  bookings: any[] = [];
  private refreshInterval: any;
  private clockInterval: any;
  currentTime: Date = new Date();

  constructor(
    private socketService: SocketService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    // Load initial data
    this.loadInitialData();
    
    // Set up auto refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadInitialData();
    }, 30000);
    
    // Update current time every second
    this.clockInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    
    // Join admin room to receive updates
    this.socketService.joinAdminRoom();

    // Listen for new bookings
    this.subscriptions.push(
      this.socketService.onNewBooking().subscribe(data => {
        this.addNotification({
          type: 'success',
          message: `حجز جديد للسيارة: ${data.booking.carId.brand} ${data.booking.carId.model}`,
          timestamp: data.timestamp,
          icon: 'fa-calendar-check'
        });
      })
    );

    // Listen for car added
    this.subscriptions.push(
      this.socketService.onCarAdded().subscribe(data => {
        this.addNotification({
          type: 'info',
          message: `تمت إضافة سيارة جديدة: ${data.car.brand} ${data.car.model}`,
          timestamp: data.timestamp,
          icon: 'fa-plus-circle'
        });
      })
    );

    // Listen for car updated
    this.subscriptions.push(
      this.socketService.onCarUpdated().subscribe(data => {
        this.addNotification({
          type: 'info',
          message: `تم تحديث بيانات السيارة: ${data.car.brand} ${data.car.model}`,
          timestamp: data.timestamp,
          icon: 'fa-edit'
        });
      })
    );

    // Listen for car deleted
    this.subscriptions.push(
      this.socketService.onCarDeleted().subscribe(data => {
        this.addNotification({
          type: 'warning',
          message: `تم حذف سيارة: ${data.car.brand} ${data.car.model}`,
          timestamp: data.timestamp,
          icon: 'fa-trash'
        });
      })
    );

    // Listen for car availability changes
    this.subscriptions.push(
      this.socketService.onCarAvailabilityChanged().subscribe(data => {
        const status = data.car.available ? 'متاحة' : 'غير متاحة';
        this.addNotification({
          type: 'info',
          message: `تغيرت حالة السيارة ${data.car.brand} ${data.car.model} إلى: ${status}`,
          timestamp: data.timestamp,
          icon: 'fa-exchange-alt'
        });
      })
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Clear auto refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Clear clock interval
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  addNotification(notification: Notification): void {
    // Check if similar notification already exists
    const existingIndex = this.notifications.findIndex(
      n => n.message === notification.message && 
           Math.abs(new Date(n.timestamp).getTime() - new Date(notification.timestamp).getTime()) < 60000
    );

    if (existingIndex === -1) {
      // Add new notification to the beginning of the array
      this.notifications.unshift(notification);

      // Keep only the latest 10 notifications
      if (this.notifications.length > 10) {
        this.notifications = this.notifications.slice(0, 10);
      }
    }
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  calculateTotalPrice(booking: any): number {
    if (booking.totalPrice) {
      return booking.totalPrice;
    }
    
    // حساب الفرق بالساعات بدقة
    const diffMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    
    // حساب الأيام بناءً على الساعات (مع تقريب لأعلى)
    const days = Math.ceil(hours / 24);
    
    return booking.carId?.pricePerDay * days || 0;
  }
  
  // حساب مدة الإيجار بالساعات والأيام
  calculateBookingDuration(booking: any): string {
    const diffMs = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
    const hours = Math.ceil(diffMs / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (days > 0 && remainingHours > 0) {
      return `${days} يوم و ${remainingHours} ساعة`;
    } else if (days > 0) {
      return `${days} يوم`;
    } else {
      return `${hours} ساعة`;
    }
  }

  getTimeAgo(timestamp: Date): string {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    
    if (seconds < 60) {
      return 'الآن';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `منذ ${minutes} دقيقة`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `منذ ${hours} ساعة`;
    }
    
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  }

  refreshData(): void {
    this.loadInitialData();
  }

  refreshBookings(): void {
    this.loading = true;
    this.http.get<any[]>('http://localhost:3000/api/bookings')
      .subscribe(
        (bookings: any[]) => {
          this.bookings = bookings;
          this.loading = false;
        },
        error => {
          console.error('Error loading bookings:', error);
          alert('حدث خطأ في تحميل الحجوزات. الرجاء تحديث الصفحة.');
          this.loading = false;
        }
      );
  }

  toggleAvailability(car: any): void {
    const newAvailability = !car.available;
    this.http.patch(`http://localhost:3000/api/cars/${car._id}`, { available: newAvailability })
      .subscribe(() => {
        car.available = newAvailability;
        this.addNotification({
          type: 'info',
          message: `تم تحديث حالة السيارة: ${car.brand} ${car.model}`,
          timestamp: new Date(),
          icon: 'fa-exchange-alt'
        });
      }, error => {
        console.error('Error updating car availability:', error);
      });
  }

  deleteCar(carId: string): void {
    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      this.http.delete(`http://localhost:3000/api/cars/${carId}`)
        .subscribe(() => {
          this.cars = this.cars.filter(car => car._id !== carId);
          this.addNotification({
            type: 'warning',
            message: 'تم حذف السيارة بنجاح',
            timestamp: new Date(),
            icon: 'fa-trash'
          });
        }, error => {
          console.error('Error deleting car:', error);
        });
    }
  }

  cancelBooking(bookingId: string): void {
    if (confirm('هل أنت متأكد من إلغاء هذا الحجز؟')) {
      const booking = this.bookings.find(b => b._id === bookingId);
      this.http.patch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {})
        .subscribe(() => {
          // Update the booking status in the array
          const bookingIndex = this.bookings.findIndex(booking => booking._id === bookingId);
          if (bookingIndex !== -1) {
            this.bookings[bookingIndex].status = 'cancelled';
          }
          
          // Update car availability if booking had a car
          if (booking?.carId) {
            const carIndex = this.cars.findIndex(car => car._id === booking.carId._id);
            if (carIndex !== -1) {
              this.cars[carIndex].available = true;
              this.http.patch(`http://localhost:3000/api/cars/${booking.carId._id}`, { available: true })
                .subscribe(() => {
                  this.addNotification({
                    type: 'info',
                    message: `تم تحديث حالة السيارة: ${booking.carId.brand} ${booking.carId.model}`,
                    timestamp: new Date(),
                    icon: 'fa-car'
                  });
                });
            }
          }
          
          this.addNotification({
            type: 'warning',
            message: 'تم إلغاء الحجز بنجاح',
            timestamp: new Date(),
            icon: 'fa-calendar-times'
          });
          
          // Refresh data to update stats
          this.loadInitialData();
        }, error => {
          console.error('Error cancelling booking:', error);
          alert('حدث خطأ أثناء إلغاء الحجز. الرجاء المحاولة مرة أخرى.');
        });
    }
  }

  loadInitialData(): void {
    this.loading = true;
    
    // Load stats
    this.http.get('http://localhost:3000/api/admin/stats').subscribe(
      (data: any) => {
        this.stats = data;
        this.loading = false;
      },
      error => {
        console.error('Error loading stats:', error);
        this.loading = false;
      }
    );
    
    // Load cars
    this.http.get<any[]>('http://localhost:3000/api/cars').subscribe(
      (cars: any[]) => {
        this.cars = cars;
      },
      error => {
        console.error('Error loading cars:', error);
      }
    );
    
    // Load recent bookings
    this.http.get<any[]>('http://localhost:3000/api/bookings')
    .subscribe(
      (bookings: any[]) => {
        // Check for new bookings
        const newBookings = bookings.filter(booking => {
          // Skip if booking already exists
          if (this.bookings.some(existing => existing._id === booking._id)) {
            return false;
          }
          
          // Check if car is available for the booking period
          const carBookings = bookings.filter(b => 
            b.carId?._id === booking.carId?._id && 
            b.status !== 'cancelled'
          );
          
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          
          return !carBookings.some(otherBooking => {
            if (otherBooking._id === booking._id) return false;
            
            const otherStart = new Date(otherBooking.startDate);
            const otherEnd = new Date(otherBooking.endDate);
            
            return (
              (bookingStart >= otherStart && bookingStart <= otherEnd) ||
              (bookingEnd >= otherStart && bookingEnd <= otherEnd) ||
              (bookingStart <= otherStart && bookingEnd >= otherEnd)
            );
          });
        });
        
        this.bookings = bookings;
        console.log('Loaded bookings:', bookings); // Debug log
        
        // Add notification only for new bookings
        if (newBookings.length > 0) {
          const latestBooking = newBookings[0];
          this.addNotification({
            type: 'info',
            message: `حجز جديد للسيارة: ${latestBooking.carId?.brand} ${latestBooking.carId?.model}`,
            timestamp: new Date(),
            icon: 'fa-calendar-check'
          });
        }
      },
      error => {
        console.error('Error loading bookings:', error);
        alert('حدث خطأ في تحميل الحجوزات. الرجاء تحديث الصفحة.');
      }
    );
  }
}
