import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../services/translation.service';

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
  users: any[] = [];
  private refreshInterval: any;
  private clockInterval: any;
  currentTime: Date = new Date();

  constructor(
    private socketService: SocketService,
    private http: HttpClient,
    private authService: AuthService,
    private translationService: TranslationService
  ) { }

  ngOnInit(): void {
    // Check if token is valid
    if (!this.authService.isTokenValid()) {
      console.error('Access denied: Token is invalid or expired');
      this.authService.logout();
      return;
    }
    
    // Check if user is logged in
    if (!this.authService.isLogged()) {
      console.error('Access denied: User is not logged in');
      this.authService.logout();
      return;
    }
    
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      console.error('Access denied: User is not an admin');
      console.log('User data:', this.authService.getUser());
      this.authService.logout();
      return;
    }
    
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
          message: `${this.translationService.translate('notification.newBooking')} ${data.booking.carId.brand} ${data.booking.carId.model}`,
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
          message: `${this.translationService.translate('notification.carAdded')} ${data.car.brand} ${data.car.model}`,
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
          message: `${this.translationService.translate('notification.carUpdated')} ${data.car.brand} ${data.car.model}`,
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
          message: `${this.translationService.translate('notification.carDeleted')} ${data.car.brand} ${data.car.model}`,
          timestamp: data.timestamp,
          icon: 'fa-trash'
        });
      })
    );

    // Listen for car availability changes
    this.subscriptions.push(
      this.socketService.onCarAvailabilityChanged().subscribe(data => {
        const status = data.car.available ? this.translationService.translate('available') : this.translationService.translate('car.notAvailable');
        this.addNotification({
          type: 'info',
          message: `${this.translationService.translate('notification.carAvailabilityChanged')} ${data.car.brand} ${data.car.model} ${this.translationService.translate('notification.to')} ${status}`,
          timestamp: data.timestamp,
          icon: 'fa-exchange-alt'
        });
        
        // Update local car data
        const carIndex = this.cars.findIndex(c => c._id === data.car._id);
        if (carIndex !== -1) {
          this.cars[carIndex].available = data.car.available;
          this.cars[carIndex].isBooked = data.car.isBooked;
        }
      })
    );

    // Listen for booking deleted
    this.subscriptions.push(
      this.socketService.onBookingDeleted().subscribe(data => {
        this.addNotification({
          type: 'warning',
          message: this.translationService.translate('notification.bookingDeleted'),
          timestamp: data.timestamp,
          icon: 'fa-trash'
        });

        // Remove booking from local array
        this.bookings = this.bookings.filter(b => b._id !== data.bookingId);
        
        // Update car availability if needed
        if (data.carId) {
           const carIndex = this.cars.findIndex(c => c._id === data.carId);
           if (carIndex !== -1) {
             // We assume if a booking is deleted, the car might become available
             // But ideally we should sync or check other bookings. 
             // For now, let's just refresh data to be safe or trust the backend sync
             this.loadInitialData(); 
           }
        }
      })
    );

    // Listen for booking cancelled
    this.subscriptions.push(
      this.socketService.onBookingCancelled().subscribe(data => {
        this.addNotification({
          type: 'warning',
          message: `${this.translationService.translate('notification.bookingCancelled')} ${data.booking.carId.brand} ${data.booking.carId.model}`,
          timestamp: data.timestamp,
          icon: 'fa-ban'
        });
        
        // Update booking status locally
        const bookingIndex = this.bookings.findIndex(b => b._id === data.booking._id);
        if (bookingIndex !== -1) {
          this.bookings[bookingIndex].status = 'cancelled';
        }
        
        // Refresh data to ensure car status is correct
        this.loadInitialData();
      })
    );

    // Listen for car returned
    this.subscriptions.push(
      this.socketService.onCarReturned().subscribe(data => {
        this.addNotification({
          type: 'success',
          message: `${this.translationService.translate('notification.carReturned')} ${data.car.brand} ${data.car.model}`,
          timestamp: data.timestamp,
          icon: 'fa-check-circle'
        });
        
        // Update local data
        const carIndex = this.cars.findIndex(c => c._id === data.car._id);
        if (carIndex !== -1) {
          this.cars[carIndex].available = true;
          this.cars[carIndex].isRented = false;
        }
        
        const bookingIndex = this.bookings.findIndex(b => b._id === data.booking._id);
        if (bookingIndex !== -1) {
          this.bookings[bookingIndex].status = 'returned';
        }
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

  private getAuthHeaders() {
    const token = this.authService.getToken();
    if (!token) {
      console.error('Authentication token not found');
      this.authService.logout();
      return {};
    }
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      })
    };
  }

  refreshData(): void {
    this.loadInitialData();
  }

  refreshBookings(): void {
    this.loading = true;
    this.http.get<any[]>('http://localhost:3000/api/bookings', this.getAuthHeaders())
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
    this.http.patch(`http://localhost:3000/api/cars/${car._id}`, { available: newAvailability }, this.getAuthHeaders())
      .subscribe(() => {
        car.available = newAvailability;
        this.addNotification({
          type: 'info',
          message: `${this.translationService.translate('notification.carUpdated')} ${car.brand} ${car.model}`,
          timestamp: new Date(),
          icon: 'fa-exchange-alt'
        });
      }, error => {
        console.error('Error updating car availability:', error);
      });
  }

  deleteCar(carId: string): void {
    if (confirm('هل أنت متأكد من حذف هذه السيارة؟')) {
      this.http.delete(`http://localhost:3000/api/cars/${carId}`, this.getAuthHeaders())
        .subscribe(() => {
          this.cars = this.cars.filter(car => car._id !== carId);
          this.addNotification({
            type: 'warning',
            message: this.translationService.translate('notification.carDeleted'),
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
      this.http.patch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {}, this.getAuthHeaders())
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
            }
          }
          
          this.addNotification({
            type: 'warning',
            message: this.translationService.translate('booking.cancelSuccess'),
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

  deleteBooking(bookingId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا الحجز نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      const booking = this.bookings.find(b => b._id === bookingId);
      this.http.delete(`http://localhost:3000/api/bookings/${bookingId}`, this.getAuthHeaders())
        .subscribe(() => {
          // Remove booking from array
          this.bookings = this.bookings.filter(b => b._id !== bookingId);
          
          // Update car availability if booking had a car
          if (booking?.carId) {
            const carIndex = this.cars.findIndex(car => car._id === booking.carId._id);
            if (carIndex !== -1) {
              this.cars[carIndex].available = true;
            }
          }
          
          this.addNotification({
            type: 'danger',
            message: `${this.translationService.translate('notification.bookingDeleted')} ${booking?.carId?.brand} ${booking?.carId?.model}`,
            timestamp: new Date(),
            icon: 'fa-trash'
          });
          
          // Refresh data to update stats
          this.loadInitialData();
        }, error => {
          console.error('Error deleting booking:', error);
          alert('حدث خطأ أثناء حذف الحجز. الرجاء المحاولة مرة أخرى.');
        });
    }
  }

  deleteUser(userId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
      const user = this.users.find(u => u._id === userId);
      this.http.delete(`http://localhost:3000/api/admin/users/${userId}`, this.getAuthHeaders())
        .subscribe(() => {
          // Remove user from array immediately
          this.users = this.users.filter(u => u._id !== userId);
          
          this.addNotification({
            type: 'danger',
            message: `${this.translationService.translate('notification.userDeleted')} ${user?.name}`,
            timestamp: new Date(),
            icon: 'fa-user-times'
          });
          
          // Refresh data to update stats
          this.loadInitialData();
        }, error => {
          console.error('Error deleting user:', error);
          alert('حدث خطأ أثناء حذف المستخدم. الرجاء المحاولة مرة أخرى.');
        });
    }
  }

  syncCarStatus(): void {
    if (confirm('هل تريد مزامنة حالة جميع السيارات بناءً على الحجوزات النشطة؟')) {
      this.loading = true;
      this.http.post('http://localhost:3000/api/bookings/sync-car-status', {}, this.getAuthHeaders())
        .subscribe((response: any) => {
          this.loading = false;
          this.addNotification({
            type: 'success',
            message: `${this.translationService.translate('notification.syncSuccess')} ${response.updatedCount} ${this.translationService.translate('notification.of')} ${response.totalCars}`,
            timestamp: new Date(),
            icon: 'fa-check-circle'
          });
          
          // Refresh data to show updated car statuses
          this.loadInitialData();
        }, error => {
          this.loading = false;
          console.error('Error syncing car status:', error);
          alert('حدث خطأ أثناء مزامنة حالة السيارات. الرجاء المحاولة مرة أخرى.');
        });
    }
  }

  loadInitialData(): void {
    this.loading = true;
    
    // Load stats
    this.http.get('http://localhost:3000/api/admin/stats', this.getAuthHeaders()).subscribe(
      (data: any) => {
        this.stats = data;
        this.loading = false;
      },
      error => {
        console.error('Error loading stats:', error);
        if (error.status === 403) {
          console.error('Access forbidden. User may not have admin privileges or token may be expired.');
          this.authService.logout();
        }
        this.loading = false;
      }
    );
    
    // Load cars
    this.http.get<any[]>('http://localhost:3000/api/cars/my-agency', this.getAuthHeaders()).subscribe(
      (cars: any[]) => {
        this.cars = cars;
      },
      error => {
        console.error('Error loading cars:', error);
      }
      
    );

    // Load users
    this.http.get<any[]>('http://localhost:3000/api/admin/users', this.getAuthHeaders()).subscribe(
      (users: any[]) => {
        this.users = users;
      },
      error => {
        console.error('Error loading users:', error);
        if (error.status === 403) {
          console.error('Access forbidden. User may not have admin privileges or token may be expired.');
          this.authService.logout();
        }
      }
    );
    
    // Load recent bookings
    this.http.get<any[]>('http://localhost:3000/api/bookings', this.getAuthHeaders())
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
            message: `${this.translationService.translate('notification.newBooking')} ${latestBooking.carId?.brand} ${latestBooking.carId?.model}`,
            timestamp: new Date(),
            icon: 'fa-calendar-check'
          });
        }
      },
      error => {
        console.error('Error loading bookings:', error);
        if (error.status === 403) {
          console.error('Access forbidden. User may not have admin privileges or token may be expired.');
          this.authService.logout();
        } else {
          alert('حدث خطأ في تحميل الحجوزات. الرجاء تحديث الصفحة.');
        }
      }
    );
  }
}
