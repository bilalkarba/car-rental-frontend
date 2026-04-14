import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { injectSpeedInsights } from '@vercel/speed-insights';

/**
 * Service to integrate Vercel Speed Insights for performance monitoring.
 * This service injects the Speed Insights tracking script into the application
 * to monitor web vitals and performance metrics.
 */
@Injectable({
  providedIn: 'root'
})
export class SpeedInsightsService {
  private setRoute: ((route: string | null) => void) | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  /**
   * Initializes Vercel Speed Insights by injecting the tracking script.
   * This should be called once when the application starts, typically in the root component.
   * Only runs in browser environment (not during server-side rendering).
   */
  initialize(): void {
    if (isPlatformBrowser(this.platformId)) {
      const result = injectSpeedInsights({
        debug: false, // Set to true to see events in console during development
      });

      if (result) {
        this.setRoute = result.setRoute;
      }
    }
  }

  /**
   * Updates the current route for Speed Insights tracking.
   * Useful for dynamic route tracking in single-page applications.
   * @param route - The current route path
   */
  updateRoute(route: string | null): void {
    if (this.setRoute) {
      this.setRoute(route);
    }
  }
}
