import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CarService } from '../../services/car.service';
import { TranslationService } from '../../services/translation.service';
import { takeUntil, Subject } from 'rxjs';

@Component({
  selector: 'app-cars',
  standalone: false,
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit {
  cars: any[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private carService: CarService,
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    // الاستماع لتغييرات اللغة وتحديث الواجهة
    this.translationService.currentLanguage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.ngZone.run(() => {
          this.cd.detectChanges();
        });
      });
    
    this.carService.getAllCars().subscribe({
      next: (res) => this.cars = res,
      error: (err) => console.error(err)
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
