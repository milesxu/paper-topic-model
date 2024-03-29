import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { skip } from 'rxjs/operators';
import { ConferenceService } from './conference.service';
import { Paper } from './paper.service';

export class Distribute {
  id: string;
  name: string;
  value: number;
}
export class Organization {
  country: string;
  organizations: string[];
}
export class OrganizationRank {
  country: string;
  ranks: { organization: string; papers: number }[];
}
@Injectable({
  providedIn: 'root'
})
export class DistributeService {
  private distributeSource = new BehaviorSubject<Distribute[]>([]);
  private zeroDistribute: Distribute[] = [];
  // distribute$ = this.distributeSource.asObservable().pipe(skip(1));
  distribute$ = this.distributeSource.asObservable();
  private organizations: Organization[] = [];
  private paperCountry: number[] = [];
  private paperConference: string[] = [];
  private paperOrg: string[] = [];
  constructor(
    private http: HttpClient,
    private conferenceService: ConferenceService
  ) {
    this.initDistribute();
  }

  initDistribute() {
    forkJoin([
      this.http.get<Distribute[]>('assets/distribute.json'),
      this.http.get<Organization[]>('assets/orgs.json'),
      this.http.get<Paper[]>('assets/papers.json')
    ]).subscribe(result => {
      this.zeroDistribute = result[0];
      // this.zeroDistribute.forEach(d => (d.value = 0));
      this.organizations = result[1];
      this.DistributeInit(result[2]);
    });
  }

  get distribute() {
    return this.distributeSource.getValue();
  }

  DistributeInit(papers: Paper[]): void {
    // console.log(this.zeroDistribute);
    this.paperCountry = papers.map(paper => {
      const org = this.organizations.find(o => {
        return o.organizations.includes(paper.organization);
      });
      if (org) {
        return this.zeroDistribute.findIndex(d => {
          return d.id === org.country;
        });
      }
      return -1;
    });
    // console.log(this.paperCountry);
    this.paperConference = papers.map(paper => paper.conference);
    // console.log(this.paperConference);
    this.paperOrg = papers.map(paper => paper.organization);
    // this.distributeSource.next(this.computeDistribute(['NeurIPS2018']));
    this.conferenceService.conferences$.subscribe(conf => {
      // console.log(`${conf} is returned.`);
      this.distributeSource.next(this.computeDistribute(conf));
    });
  }

  computeDistribute(conferences: string[]): Distribute[] {
    // console.log(conferences);
    const values = new Array(this.zeroDistribute.length).fill(0);
    // console.log(dist.reduce((a, b) => a + b.value, 0));
    this.paperConference.forEach((conf, id) => {
      if (conferences.includes(conf) && this.paperCountry[id] > 0) {
        ++values[this.paperCountry[id]];
      }
    });
    return this.zeroDistribute.map((d, i) => {
      return {
        id: d.id,
        name: d.name,
        value: values[i]
      };
    });
  }

  getOrganizationRank(id: string): OrganizationRank {
    const country = this.zeroDistribute.find(d => d.id === id).name;
    const countryId = this.zeroDistribute.findIndex(d => d.id === id);
    const conferences = this.conferenceService.conferences;
    if (conferences) {
      const ranks: { organization: string; papers: number }[] = [];
      this.paperConference.forEach((conf, index) => {
        if (
          conferences.includes(conf) &&
          this.paperOrg[index] &&
          this.paperCountry[index] === countryId
        ) {
          const orgId = ranks.findIndex(
            r => r.organization === this.paperOrg[index]
          );
          if (orgId === -1) {
            ranks.push({ organization: this.paperOrg[index], papers: 1 });
          } else {
            ++ranks[orgId].papers;
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
        country,
        ranks
      };
    }
    return {
      country,
      ranks: []
    };
  }
}
