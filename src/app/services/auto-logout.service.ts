import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge, Subject, timer, Observable } from 'rxjs';
import { takeUntil, switchMap, throttleTime } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class AutoLogoutService {
  // 30 minutes in milliseconds
  private readonly LOGOUT_TIME = 1 * 60 * 1000;
  // 29 minutes in milliseconds
  private readonly WARNING_TIME = 0.5 * 60 * 1000;
  
  private destroy$ = new Subject<void>();
  private warningShown = false;

  constructor(
    private router: Router, 
    private ngZone: NgZone,
    private authService: AuthService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(DOCUMENT) private document: Document
  ) {}

  startMonitoring(): void {
    // Only execute the monitoring if we are in the browser
    if (!isPlatformBrowser(this.platformId)) {
      return; 
    }

    this.stopMonitoring();
    this.destroy$ = new Subject<void>();
    
    // Execute outside angular zone so event listeners don't trigger change detection repeatedly
    this.ngZone.runOutsideAngular(() => {
      const activity$: Observable<any> = merge(
         fromEvent(this.document, 'mousemove'),
         fromEvent(this.document, 'keydown'),
         fromEvent(this.document, 'click'),
         fromEvent(this.document, 'scroll')
      ).pipe(
         throttleTime(1000) // Don't process events more than once per second
      );

      // We need it to start monitoring immediately without waiting for the first event
      const resetTimer$ = merge(timer(0), activity$);

      resetTimer$.pipe(
         takeUntil(this.destroy$),
         switchMap(() => {
           this.warningShown = false;
           const remainingTime = this.LOGOUT_TIME - this.WARNING_TIME;
           console.log(`[AutoLogout] Activity detected. Timer reset. Warning in ${this.WARNING_TIME/1000}s, Logout in ${this.LOGOUT_TIME/1000}s total inactivity.`);
           
           // Sequence 0 will emit after WARNING_TIME, sequence 1 will emit after another (LOGOUT_TIME - WARNING_TIME)
           return timer(this.WARNING_TIME, remainingTime);
         })
      ).subscribe((sequence) => {
         this.ngZone.run(() => {
            const token = localStorage.getItem('auth_token');
            if (token) {
              if (sequence === 0) {
                 if (!this.warningShown) {
                    this.warningShown = true;
                    console.warn('[AutoLogout] Inactivity warning triggered (Sequence 0)');
                    
                    const secondsRemaining = Math.round((this.LOGOUT_TIME - this.WARNING_TIME) / 1000);
                    const timeText = secondsRemaining >= 60 
                      ? `${Math.floor(secondsRemaining / 60)} minute(s)` 
                      : `${secondsRemaining} seconds`;

                    this.toastr.warning(`You will be logged out in ${timeText} due to inactivity`, 'Warning', {
                      timeOut: 15000,
                      progressBar: true
                    });
                 }
              } else if (sequence >= 1) {
                 console.error(`[AutoLogout] Inactivity timeout reached (Sequence ${sequence}). Logging out.`);
                 this.logout();
              }
            }
         });
      });
    });
  }

  stopMonitoring(): void {
    if (this.destroy$ && !this.destroy$.closed) {
      this.destroy$.next();
      this.destroy$.complete();
    }
  }

  private logout(): void {
    console.log('[AutoLogout] Executing logout procedure');
    localStorage.removeItem('auth_token');
    
    // Call the logout logic in AuthService to clean up other local state if necessary
    this.authService.logout();
    
    this.toastr.error('Session expired, please login again', 'Session Expired');
    // Ensure navigation happens
    this.router.navigate(['/login']).then(success => {
      if (success) console.log('[AutoLogout] Successfully navigated to login');
      else console.error('[AutoLogout] Failed to navigate to login');
    });
  }
}
