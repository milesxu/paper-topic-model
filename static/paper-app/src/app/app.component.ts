import { Component, OnDestroy } from '@angular/core';
import { StateService } from './state.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  openSide = true;
  singleCheck = false;
  osSubscription: Subscription;
  constructor(private router: Router, private stateService: StateService) {
    this.osSubscription = stateService.openSide$.subscribe(side => {
      this.openSide = side;
    });
  }

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

  ngOnDestroy() {
    this.osSubscription.unsubscribe();
  }
}
