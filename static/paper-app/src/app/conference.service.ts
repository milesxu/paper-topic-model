import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {
  private readonly conferenceSource = new BehaviorSubject<string[]>([
    'NeurIPS2018'
  ]);
  readonly conferences$ = this.conferenceSource.asObservable();
  constructor() {}

  get conferences() {
    return this.conferenceSource.getValue();
  }

  changeConference(conf: string[]) {
    console.log(conf);
    this.conferenceSource.next(conf);
  }
}
