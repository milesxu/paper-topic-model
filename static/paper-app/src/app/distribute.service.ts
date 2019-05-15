import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

export class Distribute {
  id: string;
  name: string;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class DistributeService {
  private distributeSource = new BehaviorSubject<Distribute[]>([]);
  private zeroDistribute: Distribute[] = [];
  distribute$ = this.distributeSource.asObservable();
  constructor(private http: HttpClient) {
    this.initDistribute();
  }

  initDistribute() {
    this.http.get<Distribute[]>('assets/distribute.json').subscribe(dist => {
      this.zeroDistribute = dist;
      this.zeroDistribute.forEach(d => (d.value = 0));
      // console.log('init distribute service:');
      // console.log(this.zeroDistribute);
    });
  }
}
