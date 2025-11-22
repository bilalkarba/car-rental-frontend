import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CarService } from '../../services/car.service';
import { TranslationService } from '../../services/translation.service';
import { takeUntil, Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cars',
  standalone: false,
  templateUrl: './cars.component.html',
  styleUrl: './cars.component.scss'
})
export class CarsComponent implements OnInit {
  cars: any[] = [];
  filteredCars: any[] = [];
  private destroy$ = new Subject<void>();
  searchForm: FormGroup;

  constructor(
    private carService: CarService,
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      carName: [''],
      minPrice: [null],
      maxPrice: [null]
    });
  }

ngOnInit(): void {
  this.translationService.currentLanguage$
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.ngZone.run(() => {
        this.cd.detectChanges();
      });
    });
  
  this.carService.getAllCars().subscribe({
    next: (res) => {
      this.cars = res;  
      this.filteredCars = [...this.cars]; // <-- مهم بزاف
    },
    error: (err) => console.error(err)
  });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Méthode pour rechercher et filtrer les voitures
  searchCars(): void {
    const carName = this.searchForm.get('carName')?.value?.toLowerCase() || '';
    const minPrice = this.searchForm.get('minPrice')?.value || 0;
    const maxPrice = this.searchForm.get('maxPrice')?.value || Infinity;

    // Si tous les champs sont vides, afficher toutes les voitures
    if (!carName && !this.searchForm.get('minPrice')?.value && !this.searchForm.get('maxPrice')?.value) {
      this.filteredCars = [...this.cars];
      return;
    }

    // Filtrer les voitures selon les critères
    this.filteredCars = this.cars.filter(car => {
      const matchesName = !carName || 
        (car.brand && car.brand.toLowerCase().includes(carName)) || 
        (car.model && car.model.toLowerCase().includes(carName));
      
      const matchesPrice = car.pricePerDay >= minPrice && car.pricePerDay <= maxPrice;
      
      return matchesName && matchesPrice;
    });
  }

  // Réinitialiser le formulaire de recherche
  resetSearch(): void {
    this.searchForm.reset();
    this.filteredCars = [...this.cars];
  }
}
