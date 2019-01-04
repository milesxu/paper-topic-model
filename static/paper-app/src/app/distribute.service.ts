import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Distribute } from './distribute';

@Injectable({
  providedIn: 'root'
})
export class DistributeService {
  constructor(private http: HttpClient) {}

  getDistribute() {
    return this.http.get<Distribute[]>('assets/distribute.json');
  }
}
