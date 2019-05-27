import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { PerformanceResult } from '../perf-result';
import { PerfResultService } from '../perf-result.service';
import { MatTableDataSource } from '@angular/material';
import { PerformanceService } from '../performance.service';

export interface ResultCompare {
  epoch: number;
  cpu: number;
  gpu: number;
  rate: number;
}

export interface TimeCompare {
  cpu: number;
  gpu: number;
}

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent implements OnInit {
  selectedSubject = 'lntm_train';
  selectedDataset = 'nips2018';
  epochNum = 6;
  cpu_result: PerformanceResult[] = [];
  gpu_result: PerformanceResult[] = [];
  column_string: string[] = ['epoch', 'cpu', 'gpu', 'rate'];
  tableData: ResultCompare[] = [];
  dataSource = new MatTableDataSource(this.tableData);
  Highcharts = Highcharts;
  updateFlag = false;
  chartOptions = {
    chart: {
      type: 'bar',
      spacingLeft: 10,
      marginLeft: 10
    },
    series: [
      {
        name: 'Normal',
        data: []
      },
      {
        name: 'CUDA Accelerated',
        data: []
      }
    ],
    title: 'Time consuming in Bar Charts',
    xAxis: {
      categories: []
    },
    yAxis: {
      title: {
        text: 'Time Elaspsed (second)',
        align: 'high'
      }
    }
  };
  constructor(
    private perfResultService: PerfResultService,
    private performanceService: PerformanceService
  ) {}

  getResultCPU(epoch: number): void {
    // this.perfResultService.getResultCPU(epoch, 3.6).subscribe(
    //   (result: PerformanceResult) => {
    //     this.cpu_result.push(result);
    //   },
    //   error => {
    //     console.log(error);
    //   },
    //   () => {
    //     this.pushChart();
    //     this.pushTable();
    //   }
    // );
    this.performanceService.cpu.subscribe(perf => {
      this.cpu_result.push(perf);
    });
    this.performanceService.cpu_test();
  }

  getResultGPU(epoch: number): void {
    // this.perfResultService
    //   .getResultGPU(epoch, 0.98)
    //   .subscribe((result: PerformanceResult) => {
    //     this.gpu_result.push(result);
    //   });
    this.performanceService.gpu.subscribe(perf => {
      this.gpu_result.push(perf);
    });
    // this.performanceService.gpu_test();
  }

  pushTable(epoch, cpu, gpu): void {
    const r = cpu / gpu;
    this.tableData.push({
      epoch: epoch,
      cpu: cpu,
      gpu: gpu,
      rate: r
    });
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  pushChart(cpu, gpu): void {
    const len = this.chartOptions.xAxis.categories.length + 1;
    this.chartOptions.xAxis.categories.push(len);
    this.chartOptions.series[0].data.push(cpu);
    this.chartOptions.series[1].data.push(gpu);
    this.updateFlag = true;
  }

  ngOnInit() {
    this.resultAnalysis();
  }

  runSim() {
    this.getResultCPU(this.epochNum);
    this.getResultGPU(this.epochNum);
  }

  consumeTest() {
    this.performanceService.consumed.subscribe(i => {
      // console.log(i);
      this.gpu_result.push({
        count: i,
        timing: i,
        perplexity: i
      });
    });
    this.performanceService.consume();
  }

  resultAnalysis() {
    this.performanceService.complete.subscribe(c => {
      const epoch = this.epochNum;
      let cpu_time = this.cpu_result.reduce((t, cr) => {
        return t + cr.timing;
      }, 0);
      cpu_time /= epoch;
      let gpu_time = this.gpu_result.reduce((t, gr) => {
        return t + gr.timing;
      }, 0);
      gpu_time /= epoch;
      this.pushTable(epoch, cpu_time, gpu_time);
      this.pushChart(cpu_time, gpu_time);
      this.cpu_result = [];
      this.gpu_result = [];
    });
  }
}
