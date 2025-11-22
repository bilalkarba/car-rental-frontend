import { Pipe, PipeTransform, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../services/translation.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false // جعل الـ pipe غير نقلي ليتعامل مع التغييرات
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private lastValue: string = '';
  private lastKey: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private translationService: TranslationService,
    private cdr: ChangeDetectorRef
  ) {
    // الاستماع لتغييرات اللغة
    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // تحديث القيمة عند تغيير اللغة
        this.cdr.markForCheck();
      });
  }

  transform(key: string): string {
    // التحقق مما إذا كان المفتاح قد تغير
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastValue = this.translationService.translate(key);
    }
    return this.lastValue;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
