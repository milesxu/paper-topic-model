import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of, Observable, Subject } from 'rxjs';
import { Paper } from './paper';
import { Organization } from './organization';
import { Distribute } from './distribute';
import { OrganizationRank } from './organization-rank';

@Injectable({
  providedIn: 'root'
})
export class StatisticService {
  private conferencesSource = new BehaviorSubject<string[]>(['NeurIPS2018']);
  selectedConferences = this.conferencesSource.asObservable();
  private paperSource = new Subject<Paper[]>();
  selectedPapers = this.paperSource.asObservable();
  private distributeSource = new Subject<Distribute[]>();
  distributes = this.distributeSource.asObservable();
  allPapers: Paper[] = [];
  zeroDistribute: Distribute[] = [];
  organization: Organization[] = [];
  paperCountry: number[];
  conferences: string[] = ['NeurIPS2018'];
  constructor(private http: HttpClient) {
    this.DataInitialization(http);
  }

  async DataInitialization(http: HttpClient) {
    await this.getPapers(http);
    await this.getOrganization(http);
    await this.getDistribute(http);
    this.DistributeInit();
    this.distributeSource.next(this.computeDistribute(['NeurIPS2018']));
    // console.log(this.paperCountry);
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
    this.distributeSource.next(this.computeDistribute(['NeurIPS2018']));
  }

  changeSelectedConferences(conferences: string[]) {
    // console.log(conferences);
    this.conferences = conferences;
    this.conferencesSource.next(conferences);
    this.paperSource.next(this.filerPapers(conferences));
    this.distributeSource.next(this.computeDistribute(conferences));
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
}
