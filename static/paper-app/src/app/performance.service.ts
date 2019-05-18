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
  // connected = this.socket.fromEvent<string>('my response');
  constructor(private socket: Socket) {
    // this.connected.subscribe(conn => console.log(conn));
    socket
      .fromEvent<string>('my response')
      .subscribe(rspns => console.log(rspns));
    socket.fromEvent<string>('consumed').subscribe(str => console.log(str));
    socket.emit('consume');
  }
}
