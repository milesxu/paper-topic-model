import { Injectable } from '@angular/core';
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
  constructor() {}
}
