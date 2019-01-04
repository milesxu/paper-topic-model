import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Paper } from './paper';

@Injectable({
  providedIn: 'root'
})
export class PaperService {
  constructor(private http: HttpClient) {}

  getPapers() {
    return this.http.get<Paper[]>('assets/papers.json');
  }
}
