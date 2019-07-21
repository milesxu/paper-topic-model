import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import * as io from 'socket.io-client';
import { API_URL } from './env';

export class PerformanceResult {
  count: number;
  timing: number;
  perplexity: number;
}
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  connected: Observable<string>;
  consumed: Observable<number>;
  gpu: Observable<PerformanceResult>;
  cpu: Observable<PerformanceResult>;
  complete: Observable<string>;
  private socket: any;
  constructor() {
    this.socket = io(API_URL);
    this.connected = this.getObservable<string>('my response');
    this.consumed = this.getObservable<number>('consumed');
    this.gpu = this.getObservable<PerformanceResult>('gpu');
    this.cpu = this.getObservable<PerformanceResult>('cpu');
    this.complete = this.getObservable<string>('complete');
  }

  getObservable<T>(channel: string) {
    return new Observable<T>(subscriber => {
      this.socket.on(channel, data => {
        subscriber.next(data);
      });
    });
  }

  consume() {
    this.socket.emit('consume');
  }

  gpu_test() {
    this.socket.emit('gpu test');
  }

  cpu_test(conference: string, epoch: number) {
    this.socket.emit('cpu test', { conference, epoch });
  }
}
