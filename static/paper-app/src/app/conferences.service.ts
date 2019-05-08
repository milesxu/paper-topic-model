import { Injectable } from '@angular/core';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConferencesService {
  private conferencesSource = new BehaviorSubject<string[]>(['NeurIPS2018']);
  private conferences: string[] = ['NeurIPS2018'];

  selectedConferences = this.conferencesSource.asObservable();
  constructor() {}

  changeSelectedConferences(conferences: string[]) {
    console.log(conferences);
    this.conferencesSource.next(conferences);
  }

  getSelectedConferences(): Observable<string[]> {
    return of(this.conferences);
  }

  /*changeSelectedConferences(conferences: string[]) {
    if (conferences.length === 0) {
      this.conferences = [];
    } else {
      this.conferences = conferences;
    }
  }*/
}
