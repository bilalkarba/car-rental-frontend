import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslationService, LanguageCode } from './translation.service';

@Injectable({
  providedIn: 'root'
})
export class LanguageChangeService {
  constructor(
    private translationService: TranslationService,
    private router: Router
  ) {}

  changeLanguage(language: LanguageCode): void {
    // حفظ المسار الحالي
    const currentUrl = this.router.url;

    // تغيير اللغة
    this.translationService.setLanguage(language);

    // حفظ اللغة في التخزين المحلي
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('language', language);
    }

    // إعادة تحميل الصفحة بالكامل لتطبيق اللغة الجديدة
    setTimeout(() => {
      window.location.href = window.location.origin + currentUrl;
    }, 100);
  }
}
