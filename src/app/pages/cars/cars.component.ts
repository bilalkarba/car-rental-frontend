import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CarService } from '../../services/car.service';
import { AgencyService } from '../../services/agency.service';
import { TranslationService } from '../../services/translation.service';
import { takeUntil, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
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

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  paginatedCars: any[] = [];
  totalPages: number = 0;
  pages: number[] = [];

  agencyAddresses: string[] = [];
  agencies: any[] = [];

  constructor(
    private carService: CarService,
    private agencyService: AgencyService,
    private translationService: TranslationService,
    private cd: ChangeDetectorRef,
    private ngZone: NgZone,
    private fb: FormBuilder
  ) {
    this.searchForm = this.fb.group({
      carName: [''],
      minPrice: [null],
      maxPrice: [null],
      agencyAddress: ['']
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
    
    // Charger toutes les agences
    this.loadAgencies();
    
    this.carService.getAllCars().subscribe({
  next: (res) => {
    this.cars = res.map(car => ({
      ...car,
      image: this.processImageUrl(car.image)
    }));
    this.filteredCars = [...this.cars]; 
    this.extractAgencyAddresses();
    this.updatePagination();
  },
  error: (err) => console.error(err)
});



    // Real-time search
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.searchCars();
      });
  }

  private processImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/placeholder-car.png';
    
    // If it's already a Cloudinary URL or external URL, keep it
    if (imagePath.includes('cloudinary.com') || (imagePath.startsWith('http') && !imagePath.includes('localhost'))) {
      return imagePath;
    }
    
    // If it's a legacy localhost URL or relative path, return placeholder
    return 'https://placehold.co/600x400?text=Image+Unavailable';
  }

  loadAgencies(): void {
    this.agencyService.getAllAgencies().subscribe({
      next: (agencies) => {
        this.agencies = agencies;
        // Extraire les adresses des agences
        this.agencyAddresses = agencies
          .map(agency => agency.location)
          .filter((location, index, array) => array.indexOf(location) === index && location);
      },
      error: (err) => {
        console.log('Error loading agencies:', err);
        // Fallback: charger les adresses depuis les voitures
        this.extractAgencyAddresses();
      }
    });
  }

  extractAgencyAddresses(): void {
    const addresses = new Set<string>();
    
    // D'abord, utiliser les adresses des agences
    this.agencies.forEach(agency => {
      if (agency.location) {
        addresses.add(agency.location);
      }
    });

    // Ensuite, ajouter les adresses des voitures (fallback)
    this.cars.forEach(car => {
      if (car.agencyId && car.agencyId.location) {
        addresses.add(car.agencyId.location);
      } else if (car.agencyId && car.agencyId.address) {
        addresses.add(car.agencyId.address);
      }
    });

    this.agencyAddresses = Array.from(addresses).sort();
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
    const agencyAddress = this.searchForm.get('agencyAddress')?.value || '';

    // Si tous les champs sont vides, afficher toutes les voitures
    if (!carName && !this.searchForm.get('minPrice')?.value && !this.searchForm.get('maxPrice')?.value && !agencyAddress) {
      this.filteredCars = [...this.cars];
    } else {
      // Filtrer les voitures selon les critères
      this.filteredCars = this.cars.filter(car => {
        const matchesName = !carName || 
          (car.brand && car.brand.toLowerCase().includes(carName)) || 
          (car.model && car.model.toLowerCase().includes(carName));
        
        const matchesPrice = car.pricePerDay >= minPrice && car.pricePerDay <= maxPrice;
        
        const matchesAddress = !agencyAddress || (car.agencyId && car.agencyId.address === agencyAddress);
        
        return matchesName && matchesPrice && matchesAddress;
      });
    }
    
    // Reset to first page and update pagination
    this.currentPage = 1;
    this.updatePagination();
  }

  // Réinitialiser le formulaire de recherche
  resetSearch(): void {
    this.searchForm.reset();
    this.filteredCars = [...this.cars];
    this.currentPage = 1;
    this.updatePagination();
  }

  // Pagination methods
  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredCars.length / this.itemsPerPage);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCars = this.filteredCars.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
      // Scroll to top of grid
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
