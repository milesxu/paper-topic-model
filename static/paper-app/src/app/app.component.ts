import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  openSide = true;
  singleCheck = false;
  constructor(private router: Router) {}

  gotoUrl(url: string): void {
    if (url.endsWith('performance')) {
      this.openSide = false;
    } else {
      this.openSide = true;
    }
    if (url.endsWith('word-cloud')) {
      this.singleCheck = true;
    } else {
      this.singleCheck = false;
    }
    this.router.navigateByUrl(url);
  }
}
