import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterLink],
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  constructor() { }
}
