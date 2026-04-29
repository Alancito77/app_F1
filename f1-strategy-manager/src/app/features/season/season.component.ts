import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-season',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './season.component.html',
  styleUrls: ['./season.component.css']
})
export class SeasonComponent {}
