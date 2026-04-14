import { Injectable } from '@angular/core';
import Pusher from 'pusher-js';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private pusher: Pusher;
  private channel: any;

  constructor() {
    // Initialize Pusher
    this.pusher = new Pusher(environment.pusherKey || 'your_pusher_key', {
      cluster: environment.pusherCluster || 'eu',
      forceTLS: true
    });

    // Subscribe to the admin channel
    this.channel = this.pusher.subscribe('admin-channel');
  }

  // Join admin room (Not needed for Pusher but kept for API compatibility)
  joinAdminRoom(): void {
    console.log('📡 Pusher: Subscribed to admin-channel');
  }

  // Listen for new bookings
  onNewBooking(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('new-booking', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car added
  onCarAdded(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('car-added', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car updated
  onCarUpdated(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('car-updated', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car deleted
  onCarDeleted(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('car-deleted', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car availability changes
  onCarAvailabilityChanged(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('car-availability-changed', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for booking deleted
  onBookingDeleted(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('booking-deleted', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for booking cancelled
  onBookingCancelled(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('booking-cancelled', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car returned
  onCarReturned(): Observable<any> {
    return new Observable(observer => {
      this.channel.bind('car-returned', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Disconnect Pusher
  disconnect(): void {
    if (this.pusher) {
      this.pusher.disconnect();
    }
  }
}
