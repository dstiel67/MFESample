import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  currentTime = signal(new Date().toLocaleString());

  constructor() {
    setInterval(() => {
      this.currentTime.set(new Date().toLocaleString());
    }, 1000);
  }
}
