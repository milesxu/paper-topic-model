import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  private singleCheckSource = new BehaviorSubject<boolean>(false);
  singleCheck$ = this.singleCheckSource.asObservable();
  constructor() {}

  get singleCheck() {
    return this.singleCheckSource.getValue();
  }

  singleCheckUpdate(check: boolean) {
    this.singleCheckSource.next(check);
  }
}
