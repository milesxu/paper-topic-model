import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';
import 'rxjs/add/operator/skip';
import { Paper } from './paper';
import { Organization } from './organization';
import { Distribute } from './distribute';
import { OrganizationRank } from './organization-rank';
import { Word } from './word';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private conferencesSource = new BehaviorSubject<string[]>(['NeurIPS2018']);
  selectedConferences = this.conferencesSource.asObservable();
  private paperSource = new BehaviorSubject<Paper[]>(undefined);
  selectedPapers: Observable<Paper[]> = this.paperSource.asObservable().skip(1);
  private distributeSource = new BehaviorSubject<Distribute[]>(undefined);
  distributes: Observable<Distribute[]> = this.distributeSource.asObservable();
  private wordSource = new BehaviorSubject<Word[]>(undefined);
  selectedWords: Observable<Word[]> = this.wordSource.asObservable().skip(1);
  allPapers: Paper[] = [];
  zeroDistribute: Distribute[] = [];
  organization: Organization[] = [];
  paperCountry: number[];
  confWords: { conference: string; word: Word[] }[] = [];
  conferences: string[] = ['NeurIPS2018'];
  constructor(private http: HttpClient) {
    this.DataInitialization(http);
  }

  async DataInitialization(http: HttpClient) {
    await this.getPapers(http);
    await this.getOrganization(http);
    await this.getDistribute(http);
    this.DistributeInit();
    // this.distributeSource.next(this.computeDistribute(['NeurIPS2018']));
    this.paperSource.next(this.allPapers);
    this.distributeSource.next(this.computeDistribute['NeurIPS2018']);
    // console.log(this.paperCountry);
    await this.getConferenceWords(http);
    // this.wordSource.next(this.computeWord('NeurIPS2018'));
    this.wordSource.next(this.computeWord('NeurIPS2018'));
  }

  async getPapers(http: HttpClient) {
    /*http.get<Paper[]>('assets/papers.json').subscribe(papers => {
    });*/
    await http
      .get<Paper[]>('assets/papers.json')
      .toPromise()
      .then(papers => {
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

  async getOrganization(http: HttpClient) {
    /*http.get<Organization[]>('assets/orgs.json').subscribe(orgs => {
      this.organization = orgs;
    });*/
    await http
      .get<Organization[]>('assets/orgs.json')
      .toPromise()
      .then(orgs => {
        this.organization = orgs;
      });
  }

  async getDistribute(http: HttpClient) {
    await http
      .get<Distribute[]>('assets/distribute.json')
      .toPromise()
      .then(dist => {
        dist.forEach(d => {
          this.zeroDistribute.push({
            id: d.id,
            name: d.name,
            value: 0
          });
        });
      });
  }

  async getConferenceWords(http: HttpClient) {
    // const conf = ["NeurIPS2018", "ICLR2019", "ICML2018", "CVPR2018"];
    // const url = [
    //   "assets/nips2018_word_cloud.json",
    //   "assets/iclr2019_word_cloud.json",
    //   "assets/icml2018_word_cloud.json",
    //   "assets/cvpr2018_word_cloud.json"
    // ];
    // url.forEach((u, i) => {
    //   await http
    //     .get<Word[]>("assets/nips2018_word_cloud.json")
    //     .toPromise()
    //     .then(w => {
    //       this.confWords.push({
    //         conference: "NeurIPS2018",
    //         word: w
    //       });
    //     });
    // });
    await http
      .get<Word[]>('assets/nips2018_word_cloud.json')
      .toPromise()
      .then(w => {
        this.confWords.push({
          conference: 'NeurIPS2018',
          word: w
        });
      });
    await http
      .get<Word[]>('assets/iclr2019_word_cloud.json')
      .toPromise()
      .then(w => {
        this.confWords.push({
          conference: 'ICLR2019',
          word: w
        });
      });
    await http
      .get<Word[]>('assets/icml2018_word_cloud.json')
      .toPromise()
      .then(w => {
        this.confWords.push({
          conference: 'ICML2018',
          word: w
        });
      });
    await http
      .get<Word[]>('assets/cvpr2018_word_cloud.json')
      .toPromise()
      .then(w => {
        this.confWords.push({
          conference: 'CVPR2018',
          word: w
        });
      });
  }

  computeWord(conference: string): Word[] {
    return this.confWords.find(cw => cw.conference === conference).word;
  }

  computeDistribute(conferences: string[]): Distribute[] {
    const dist: Distribute[] = [...this.zeroDistribute];
    // console.log(dist);
    this.allPapers.forEach((paper, id) => {
      if (conferences.includes(paper.conference) && this.paperCountry[id] > 0) {
        ++dist[this.paperCountry[id]].value;
      }
    });
    return dist;
  }

  DistributeInit(): void {
    // console.log(this.zeroDistribute);
    this.paperCountry = this.allPapers.map(paper => {
      const org = this.organization.find(o => {
        return o.organizations.includes(paper.organization);
      });
      if (org) {
        return this.zeroDistribute.findIndex(d => {
          return d.id === org.country;
        });
      }
      return -1;
    });
    // this.distributeSource.next(this.computeDistribute(['NeurIPS2018']));
  }

  changeSelectedConferences(conferences: string[]) {
    // console.log(conferences);
    this.conferences = conferences.filter((v, i, self) => {
      return self.indexOf(v) === i;
    });
    console.log(this.conferences);
    // this.conferences = conferences;
    this.conferencesSource.next(conferences);
    this.paperSource.next(this.filerPapers(conferences));
    this.distributeSource.next(this.computeDistribute(conferences));
    this.wordSource.next(this.computeWord(conferences[0]));
  }

  getOrganizationRank(id: string): OrganizationRank {
    const country = this.zeroDistribute.find(d => d.id === id).name;
    const country_id = this.zeroDistribute.findIndex(d => d.id === id);
    if (this.conferences) {
      const ranks: { organization: string; papers: number }[] = [];
      this.allPapers.forEach((p, index) => {
        if (
          this.conferences.includes(p.conference) &&
          p.organization &&
          this.paperCountry[index] === country_id
        ) {
          const org_id = ranks.findIndex(
            r => r.organization === p.organization
          );
          if (org_id === -1) {
            ranks.push({ organization: p.organization, papers: 1 });
          } else {
            ++ranks[org_id].papers;
          }
        }
      });
      ranks.sort((a, b) => {
        return b.papers - a.papers;
      });
      if (ranks.length > 10) {
        ranks.length = 10;
      }
      return {
        country: country,
        ranks: ranks
      };
    }
    return {
      country: country,
      ranks: []
    };
  }

  getPaperByTopic(topic: string[]): Paper[] {
    if (topic) {
      return this.allPapers.filter(p => p.abstract.includes(topic[0]));
    } else {
      return [];
    }
  }
}
