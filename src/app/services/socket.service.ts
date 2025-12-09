import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', {
      withCredentials: true
    });
  }

  // Join admin room for dashboard updates
  joinAdminRoom(): void {
    this.socket.emit('join-admin');
  }

  // Listen for new bookings
  onNewBooking(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('new-booking', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car added
  onCarAdded(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('car-added', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car updated
  onCarUpdated(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('car-updated', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car deleted
  onCarDeleted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('car-deleted', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car availability changes
  onCarAvailabilityChanged(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('car-availability-changed', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for booking deleted
  onBookingDeleted(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('booking-deleted', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for booking cancelled
  onBookingCancelled(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('booking-cancelled', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Listen for car returned
  onCarReturned(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('car-returned', (data: any) => {
        observer.next(data);
      });
    });
  }

  // Disconnect socket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}
