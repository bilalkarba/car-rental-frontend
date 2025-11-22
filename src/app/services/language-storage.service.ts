import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LanguageStorageService {
  private languageChangeSubject = new BehaviorSubject<string>('ar');
  public languageChange$: Observable<string> = this.languageChangeSubject.asObservable();

  constructor() {
    // الاستماع لتغييرات التخزين المحلي من نوافذ أخرى
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === 'app_language') {
          this.languageChangeSubject.next(event.newValue || 'ar');
          // إعادة تحميل الصفحة لتطبيق التغييرات
          window.location.reload();
        }
      });
    }
  }

  setLanguage(language: string): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('app_language', language);
      this.languageChangeSubject.next(language);

      // إعادة تحميل الصفحة فوراً لتطبيق اللغة الجديدة
      window.location.reload();
    }
  }

  getLanguage(): string {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      return localStorage.getItem('app_language') || 'ar';
    }
    return 'ar';
  }
}
