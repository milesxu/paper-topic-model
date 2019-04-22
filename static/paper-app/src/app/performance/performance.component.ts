import { Component, OnInit } from '@angular/core';
import { PerformanceResult } from '../perf-result';
import { PerfResultService } from '../perf-result.service';

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent implements OnInit {
  cpu_result: PerformanceResult[];
  gpu_result: PerformanceResult[];
  test_str: number;
  constructor(private perResultService: PerfResultService) {}

  getResult(): void {
    this.perResultService.getResult().subscribe((result: PerformanceResult) => {
      this.cpu_result.push(result);
      this.test_str = this.cpu_result.length;
      console.log(result);
    });
  }

  ngOnInit() {
    this.getResult();
  }
}
