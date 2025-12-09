import { Component, OnInit, ChangeDetectorRef, NgZone, Inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { TranslationService, LanguageCode } from './services/translation.service';
import { takeUntil, Subject } from 'rxjs';
import { LanguageStorageService } from './services/language-storage.service';
import { DOCUMENT } from '@angular/common';
import AOS from 'aos';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'car-rental-frontend';
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
    private router: Router,
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private languageStorageService: LanguageStorageService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      once: true,
      mirror: false
    });

    // كل مرة تتبدّل اللغة، نحدث العرض مباشرة بلا refresh
    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe((lang: LanguageCode) => {
        this.ngZone.run(() => {
          // Update direction and language
          const htmlTag = this.document.documentElement;
          htmlTag.lang = lang;
          htmlTag.dir = lang === 'ar' ? 'rtl' : 'ltr';

          // إجبار تحديث الواجهة بالكامل
          this.cd.detectChanges();
        });
      });
      
    // الاستماع لتغييرات التخزين المحلي
    this.languageStorageService.languageChange$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          // إجبار تحديث الواجهة بالكامل
          this.cd.detectChanges();
        });
      });
  }

  logout(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.authService.logout();
    this.router.navigate(['/login']); // بدون refresh كامل
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
