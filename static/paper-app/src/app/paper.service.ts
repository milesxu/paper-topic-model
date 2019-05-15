import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StatisticService } from './statistic.service';
import { Observable, Subject, merge, BehaviorSubject } from 'rxjs';
import {} from 'rxjs/add/operator/filter';
// import { combineLatest } from "rxjs/operators";
import {} from 'rxjs/add/operator/combineLatest';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/concatAll';
import 'rxjs/add/operator/mergeAll';

export class Paper {
  conference: string;
  title: string;
  intro: string;
  pdf: string;
  abstract: string;
  authors: string[];
  organization: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaperService {
  private allPapers: Paper[] = [];
  private paperSource = new Subject<Paper[]>();
  papers = this.paperSource.asObservable();
  constructor(
    private http: HttpClient,
    private statisticService: StatisticService
  ) {
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
      const confs = this.statisticService.conferencesSource.getValue();
      this.paperSource.next(this.filterPapers(confs, papers));
    });
    this.getPapers();
  }

  getPapers() {
    this.statisticService.selectedConferences.subscribe(confs => {
      this.paperSource.next(this.filterPapers(confs, this.allPapers));
    });
  }

  filterPapers(conference: string[], papers: Paper[]) {
    return papers.filter(p => conference.includes(p.conference));
  }
}
