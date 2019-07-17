import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private singleCheckSource = new BehaviorSubject<boolean>(false);
  private openSideSource = new BehaviorSubject<boolean>(true);
  singleCheck$ = this.singleCheckSource.asObservable();
  openSide$ = this.openSideSource.asObservable();
  constructor() {}

  get singleCheck() {
    return this.singleCheckSource.getValue();
  }

  singleCheckUpdate(check: boolean) {
    this.singleCheckSource.next(check);
  }

  get openSide() {
    return this.openSideSource.getValue();
  }

  openSideUpdate(open: boolean) {
    this.openSideSource.next(open);
  }
}
