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
  selectedConferences = this.conferencesSource.asObservable();
  private paperSource = new Subject<Paper[]>();
  selectedPapers = this.paperSource.asObservable();
  allPapers: Paper[] = [];
  organization: Organization[] = [];
  constructor(private http: HttpClient) {
    this.getPapers(http);
    this.http.get<Organization[]>('assets/orgs.json').subscribe(orgs => {
      this.organization = orgs;
    });
  }

  getPapers(http: HttpClient) {
    http.get<Paper[]>('assets/papers.json').subscribe(papers => {
      this.allPapers = papers;
      this.allPapers.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
      this.paperSource.next(this.filerPapers(['NeurIPS2018']));
    });
  }

  filerPapers(conferences: string[]): Paper[] {
    return this.allPapers.filter(paper =>
      conferences.includes(paper.conference)
    );
  }

  getOrganization() {}

  changeSelectedConferences(conferences: string[]) {
    // console.log(conferences);
    this.conferencesSource.next(conferences);
    this.paperSource.next(this.filerPapers(conferences));
  }
}
