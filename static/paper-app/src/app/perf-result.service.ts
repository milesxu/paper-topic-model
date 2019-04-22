import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './env';
import { PerformanceResult } from './perf-result';

@Injectable({
  providedIn: 'root'
})
export class PerfResultService {
  constructor(private http: HttpClient) {}

  getResult() {
    return this.http.get<PerformanceResult>(`${API_URL}/stream`);
  }
}
