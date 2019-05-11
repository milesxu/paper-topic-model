import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { Paper } from './paper';
import { Organization } from './organization';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private conferencesSource = new BehaviorSubject<string[]>(['NeurIPS2018']);
  private conferences: string[] = ['NeurIPS2018'];
  selectedConferences = this.conferencesSource.asObservable();
  constructor(private http: HttpClient) {}

  getPapers() {
    return this.http.get<Paper[]>('assets/papers.json');
  }

  getOrganization() {
    return this.http.get<Organization[]>('assets/orgs.json');
  }

  changeSelectedConferences(conferences: string[]) {
    // console.log(conferences);
    this.conferencesSource.next(conferences);
  }

  getSelectedConferences(): Observable<string[]> {
    return of(this.conferences);
  }
}
