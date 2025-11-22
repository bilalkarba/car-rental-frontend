import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from "../../pipes/translate.pipe";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [TranslatePipe, RouterLink]
})
export class HomeComponent {
  constructor() { }
}
