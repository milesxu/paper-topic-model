import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ConferenceService } from './conference.service';

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
  papers$ = this.paperSource.asObservable();
  private topic: string[] = [];
  constructor(
    private http: HttpClient,
    private conferenceService: ConferenceService
  ) {
    http.get<Paper[]>('assets/papers.json').subscribe(papers => {
      this.allPapers = papers;
      console.log(this.allPapers.length);
      this.allPapers.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
      // const confs = this.conferenceService.conferences;
      this.paperSource.next(this.papers);
    });
    this.getPapers();
  }

  get papers() {
    const confs = this.conferenceService.conferences;
    return this.filterPapers(confs, this.allPapers);
  }

  getPapers() {
    this.conferenceService.conferences$.subscribe(confs => {
      this.paperSource.next(this.filterPapers(confs, this.allPapers));
    });
  }

  filterPapers(conference: string[], papers: Paper[]) {
    return this.getPaperByTopic(
      papers.filter(p => conference.includes(p.conference))
    );
  }

  getPaperByTopic(papers: Paper[]) {
    return this.topic
      ? papers.filter(p => p.abstract.includes(this.topic[0]))
      : [];
  }

  changeTopic(topic: string[]) {
    this.topic = topic;
    const conf = this.conferenceService.conferences;
    const papers = this.filterPapers(conf, this.allPapers);
    this.paperSource.next(this.getPaperByTopic(papers));
  }
}
