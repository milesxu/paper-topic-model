import { Injectable } from '@angular/core';
// import { Socket } from 'ngx-socket-io';

export class PerformanceResult {
  count: number;
  timing: number;
  perplexity: number;
}
@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  /*connected = this.socket.fromEvent<string>('my response');
  consumed = this.socket.fromEvent<number>('consumed');
  gpu = this.socket.fromEvent<PerformanceResult>('gpu');
  cpu = this.socket.fromEvent<PerformanceResult>('cpu');
  complete = this.socket.fromEvent<string>('complete');*/
  constructor() {
    // socket
    // .fromEvent<string>('my response')
    // .subscribe(rspns => console.log(rspns));
  }
  consume() {
    // this.socket.emit('consume');
  }

  gpu_test() {
    // this.socket.emit('gpu test');
  }

  cpu_test(conference: string, epoch: number) {
    // this.socket.emit('cpu test', { conference, epoch });
  }
}
