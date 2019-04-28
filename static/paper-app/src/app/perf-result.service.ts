import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';
import { timer } from 'rxjs';
import { timeInterval, map, take } from 'rxjs/operators';
import { API_URL } from './env';
import { PerformanceResult } from './perf-result';
// import { number } from '@amcharts/amcharts4/core';

@Injectable({
  providedIn: 'root'
})
export class PerfResultService {
  pArray: number[] = [
    2867.19,
    1846.97,
    1631.29,
    1512.81,
    1439.12,
    1421.98,
    1388.79,
    1364.91,
    1348.78,
    1345.59,
    1333.36,
    1336.96,
    1307.97,
    1308.4,
    1309.24,
    1303.37,
    1299.04,
    1300.12,
    1294.67,
    1289.26
  ];
  constructor(private http: HttpClient) {}

  // getResult() {
  //   return this.http.get<PerformanceResult>(`${API_URL}/stream`);
  // }

  getResultCPU(epoch: number, interval: number) {
    return timer(3000, interval * 1000).pipe(
      timeInterval(),
      map(t => {
        return {
          count: t.value,
          timing: interval,
          perplexity: this.pArray[t.value]
        };
      }),
      take(epoch)
    );
  }

  getResultGPU(epoch: number, interval: number) {
    return this.getResultCPU(epoch, interval);
  }
}
