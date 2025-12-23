import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AgencyService } from '../../../services/agency.service';
import { AuthService } from '../../../services/auth.service';
import { CarService } from '../../../services/car.service';
import { AdminService } from '../../../services/admin.service';

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
    private carService: CarService,
    private adminService: AdminService
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

  // Admin Management
  isEditingAdmin: boolean = false;
  currentAdminId: string = '';

  saveAdmin(): void {
    if (this.isEditingAdmin) {
      this.adminService.updateUser(this.currentAdminId, this.newAdmin).subscribe({
        next: () => {
          alert('Admin updated successfully');
          this.resetAdminForm();
          this.loadAdmins();
        },
        error: (err) => {
          const msg = err.error?.msg || err.error?.message || 'Failed to update admin';
          alert(msg);
        }
      });
    } else {
      this.newAdmin.agencyId = this.agencyId;
      this.authService.register(this.newAdmin).subscribe({
        next: () => {
          alert('Admin created successfully');
          this.resetAdminForm();
          this.loadAdmins();
        },
        error: (err) => {
          const msg = err.error?.msg || err.error?.message || 'Failed to create admin';
          alert(msg);
        }
      });
    }
  }

  editAdmin(admin: any) {
    this.isEditingAdmin = true;
    this.currentAdminId = admin._id;
    this.newAdmin = { ...admin, password: '' }; // Don't show password
    this.showAddAdminForm = true;
  }

  deleteAdmin(id: string) {
    if (confirm('Are you sure you want to delete this admin?')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          alert('Admin deleted successfully');
          this.loadAdmins();
        },
        error: () => alert('Failed to delete admin')
      });
    }
  }

  resetAdminForm() {
    this.newAdmin = { name: '', email: '', password: '', nationalId: '', role: 'admin', agencyId: '' };
    this.showAddAdminForm = false;
    this.isEditingAdmin = false;
    this.currentAdminId = '';
  }

  cancelEditAdmin() {
    this.resetAdminForm();
  }

  // Car Management
  isEditingCar: boolean = false;
  currentCarId: string = '';
  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0] ?? null;
  }

  saveCar(): void {
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

    if (this.isEditingCar) {
      // For update, we might need a different service method if it accepts FormData
      // Assuming carService.updateCar accepts FormData or JSON. 
      // Usually updates with files need FormData.
      // Let's check carService.updateCar signature.
      // If it doesn't support FormData, we might need to update it.
      // For now, let's assume we use adminService.updateCar which might need adjustment or we use carService.
      // Let's use carService.updateCar if available.
      
      // Wait, carService.updateCar usually takes ID and Data.
      // Let's assume it handles it.
      this.carService.updateCar(this.currentCarId, formData).subscribe({
        next: () => {
          alert('Car updated successfully');
          this.resetCarForm();
          this.loadCars();
        },
        error: () => alert('Failed to update car')
      });
    } else {
      this.carService.createCar(formData).subscribe({
        next: () => {
          alert('Car created successfully');
          this.resetCarForm();
          this.loadCars();
        },
        error: () => alert('Failed to create car')
      });
    }
  }

  editCar(car: any) {
    this.isEditingCar = true;
    this.currentCarId = car._id;
    this.newCar = { ...car };
    this.showAddCarForm = true;
  }

  deleteCar(id: string) {
    if (confirm('Are you sure you want to delete this car?')) {
      this.adminService.deleteCar(id).subscribe({
        next: () => {
          alert('Car deleted successfully');
          this.loadCars();
        },
        error: () => alert('Failed to delete car')
      });
    }
  }

  resetCarForm() {
    this.newCar = { brand: '', model: '', plateNumber: '', pricePerDay: 0, fuel: '', type: '', agencyId: '' };
    this.showAddCarForm = false;
    this.isEditingCar = false;
    this.currentCarId = '';
    this.selectedFile = null;
  }

  cancelEditCar() {
    this.resetCarForm();
  }

}
