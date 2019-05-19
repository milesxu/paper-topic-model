import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';

export class PerformanceResult {
  count: number;
  timing: number;
  perplexity: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  connected = this.socket.fromEvent<string>('my response');
  consumed = this.socket.fromEvent<number>('consumed');
  gpu = this.socket.fromEvent<PerformanceResult>('gpu');
  cpu = this.socket.fromEvent<PerformanceResult>('cpu');
  complete = this.socket.fromEvent<string>('complete');
  constructor(private socket: Socket) {
    // this.connected.subscribe(conn => console.log(conn));
    socket
      .fromEvent<string>('my response')
      .subscribe(rspns => console.log(rspns));
    // socket.fromEvent<string>('consumed').subscribe(str => console.log(str));
    // socket.emit('consume');
  }

  consume() {
    this.socket.emit('consume');
  }

  gpu_test() {
    this.socket.emit('gpu test');
  }

  cpu_test() {
    this.socket.emit('cpu test');
  }
}
