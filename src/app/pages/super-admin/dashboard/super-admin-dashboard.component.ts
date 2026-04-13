import { Component, OnInit } from '@angular/core';
import { AgencyService } from '../../../services/agency.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-super-admin-dashboard',
  templateUrl: './super-admin-dashboard.component.html',
  styleUrls: ['./super-admin-dashboard.component.scss']
})
export class SuperAdminDashboardComponent implements OnInit {

  agencies: any[] = [];
  isLoading: boolean = true;

  newAgency = { name: '', address: '', contactEmail: '', contactPhone: '' };
  showAddForm: boolean = false;

  // ===== Admin form state =====
  showAddAdminForm: boolean = false;
  newAdmin: any = {
    name: '',
    email: '',
    password: '',
    nationalId: '',
    role: 'admin',
    agencyId: ''
  };

  // ===== Chart Data =====
  public barChartOptions: any = { scaleShowVerticalLines: false, responsive: true };
  public barChartType = 'bar';
  public barChartLegend = true;
  public revenueChartData: any[] = [{ data: [], label: 'Revenue (MAD)' }];
  public bookingsChartData: any[] = [{ data: [], label: 'Total Bookings' }];
  public barChartLabels: string[] = [];

  constructor(
    private agencyService: AgencyService,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    if (!this.authService.isSuperAdmin()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadAgencies();

    this.socketService.joinAdminRoom();
    this.socketService.onNewBooking().subscribe(() => this.loadAgencies());
    this.socketService.onBookingDeleted().subscribe(() => this.loadAgencies());
    this.socketService.onBookingCancelled().subscribe(() => this.loadAgencies());
  }

  loadAgencies() {
    this.isLoading = true;

    this.agencyService.getAgencyStats().subscribe({
      next: (data) => {
        this.agencies = data.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

        this.barChartLabels = this.agencies.map(a => a.name);
        this.revenueChartData = [{ data: this.agencies.map(a => a.totalRevenue), label: 'Revenue (MAD)' }];
        this.bookingsChartData = [{ data: this.agencies.map(a => a.totalBookings), label: 'Total Bookings' }];

        this.isLoading = false;
      },
      error: (err) => { console.error('Error loading agencies:', err); this.isLoading = false; }
    });
  }

  isEditing: boolean = false;
  currentAgencyId: string = '';

  saveAgency() {
    if (this.isEditing) {
      this.agencyService.updateAgency(this.currentAgencyId, this.newAgency).subscribe({
        next: () => {
          alert('Agency updated successfully');
          this.resetForm();
          this.loadAgencies();
        },
        error: () => alert('Failed to update agency')
      });
    } else {
      this.agencyService.createAgency(this.newAgency).subscribe({
        next: () => {
          alert('Agency created successfully');
          this.resetForm();
          this.loadAgencies();
        },
        error: () => alert('Failed to create agency')
      });
    }
  }

  editAgency(agency: any) {
    this.isEditing = true;
    this.currentAgencyId = agency._id;
    this.newAgency = { ...agency }; // Copy data
    this.showAddForm = true;
    window.scrollTo(0, 0);
  }

  deleteAgency(id: string) {
    if (confirm('Are you sure you want to delete this agency?')) {
      this.agencyService.deleteAgency(id).subscribe({
        next: () => {
          alert('Agency deleted successfully');
          this.loadAgencies();
        },
        error: () => alert('Failed to delete agency')
      });
    }
  }

  resetForm() {
    this.newAgency = { name: '', address: '', contactEmail: '', contactPhone: '' };
    this.showAddForm = false;
    this.isEditing = false;
    this.currentAgencyId = '';
  }

  cancelEdit() {
    this.resetForm();
  }

  createAdmin() {
    if (!this.newAdmin.agencyId) { alert('Please select an agency'); return; }

    this.authService.register(this.newAdmin).subscribe({
      next: () => {
        alert('Admin created successfully');
        this.newAdmin = { name: '', email: '', password: '', nationalId: '', role: 'admin', agencyId: '' };
        this.showAddAdminForm = false;
      },
      error: () => alert('Failed to create admin')
    });
  }
}
