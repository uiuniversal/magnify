import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { MagnifyDirective } from '@ngu/magnify';

@Component({
  standalone: true,
  imports: [MagnifyDirective, NgFor],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'magnify';

  arr = Array.from({ length: 10 }, (_, i) => i);
}
