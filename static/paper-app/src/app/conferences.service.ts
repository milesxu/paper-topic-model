import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConferencesService {
  private conferencesSource = new BehaviorSubject<string[]>(['NeurIPS2018']);

  selectedConferences = this.conferencesSource.asObservable();
  constructor() {}

  changeSelectedConferences(conferences: string[]) {
    this.conferencesSource.next(conferences);
  }
}
