import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgencyService } from '../../../services/agency.service';
import { AuthService } from '../../../services/auth.service';
import { CarService } from '../../../services/car.service';

@Component({
  selector: 'app-agency-details',
  templateUrl: './agency-details.component.html',
  styleUrls: ['./agency-details.component.scss'],
  standalone: false
})
export class AgencyDetailsComponent implements OnInit {
  agencyId: string = '';
  agency: any = null;
  admins: any[] = [];
  cars: any[] = [];
  isLoading: boolean = true;
  activeTab: 'info' | 'admins' | 'cars' = 'info';

  // Forms state
  showAddAdminForm: boolean = false;
  showAddCarForm: boolean = false;

  newAdmin: any = {
    name: '',
    email: '',
    password: '',
    nationalId: '',
    role: 'admin',
    agencyId: ''
  };

  newCar: any = {
    brand: '',
    model: '',
    plateNumber: '',
    pricePerDay: 0,
    fuel: '',
    type: '',
    agencyId: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private agencyService: AgencyService,
    private authService: AuthService,
    private carService: CarService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isSuperAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.agencyId = this.route.snapshot.paramMap.get('id') || '';
    if (this.agencyId) {
      this.loadData();
    }
  }

  loadData(): void {
    this.isLoading = true;
    // Load Agency Details
    this.agencyService.getAgencyById(this.agencyId).subscribe({
      next: (data) => {
        this.agency = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading agency:', err);
        this.isLoading = false;
      }
    });

    this.loadAdmins();
    this.loadCars();
  }

  loadAdmins(): void {
    this.agencyService.getAgencyAdmins(this.agencyId).subscribe({
      next: (data) => this.admins = data,
      error: (err) => console.error('Error loading admins:', err)
    });
  }

  loadCars(): void {
    this.agencyService.getAgencyCars(this.agencyId).subscribe({
      next: (data) => this.cars = data,
      error: (err) => console.error('Error loading cars:', err)
    });
  }

  createAdmin(): void {
    this.newAdmin.agencyId = this.agencyId;
    this.authService.register(this.newAdmin).subscribe({
      next: (res) => {
        alert('Admin created successfully');
        this.showAddAdminForm = false;
        this.newAdmin = { name: '', email: '', password: '', nationalId: '', role: 'admin', agencyId: '' };
        this.loadAdmins();
      },
      error: (err) => {
        console.error('Error creating admin:', err);
        alert('Failed to create admin');
      }
    });
  }

  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  createCar(): void {
    const formData = new FormData();
    formData.append('brand', this.newCar.brand);
    formData.append('model', this.newCar.model);
    formData.append('plateNumber', this.newCar.plateNumber);
    formData.append('pricePerDay', this.newCar.pricePerDay.toString());
    formData.append('fuel', this.newCar.fuel);
    formData.append('type', this.newCar.type);
    formData.append('agencyId', this.agencyId);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.carService.createCar(formData).subscribe({
      next: (res) => {
        alert('Car created successfully');
        this.showAddCarForm = false;
        this.newCar = { brand: '', model: '', plateNumber: '', pricePerDay: 0, fuel: '', type: '', agencyId: '' };
        this.selectedFile = null;
        this.loadCars();
      },
      error: (err) => {
        console.error('Error creating car:', err);
        alert('Failed to create car');
      }
    });
  }
}
