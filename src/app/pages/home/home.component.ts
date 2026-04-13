import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from "../../pipes/translate.pipe";
import { CarService } from '../../services/car.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [TranslatePipe, RouterLink, CommonModule]
})
export class HomeComponent implements OnInit {
  featuredCars: any[] = [];

  constructor(
    private carService: CarService,
    public authService: AuthService
  ) { }

  ngOnInit(): void {
    this.carService.getAllCars().subscribe(cars => {
      // Get first 3 cars for display
      this.featuredCars = cars.slice(0, 3);
    });
  }
}
