import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Magnify } from 'projects/ngu/magnify/src/public-api';

@Component({
  standalone: true,
  imports: [Magnify, NgFor, NgIf],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'magnify';
  isOpen = true;

  arr = Array.from({ length: 10 }, (_, i) => i);
}
