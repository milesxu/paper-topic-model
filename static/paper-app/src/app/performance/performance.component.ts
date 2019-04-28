import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import { PerformanceResult } from '../perf-result';
import { PerfResultService } from '../perf-result.service';
import { MatTableDataSource } from '@angular/material';

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
      type: 'bar'
    },
    series: [
      {
        name: 'CPU',
        data: []
      },
      {
        name: 'GPU',
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
  constructor(private perfResultService: PerfResultService) {}

  getResultCPU(epoch: number): void {
    this.perfResultService.getResultCPU(epoch, 3.6).subscribe(
      (result: PerformanceResult) => {
        this.cpu_result.push(result);
      },
      error => {
        console.log(error);
      },
      () => {
        this.pushChart();
        this.pushTable();
      }
    );
  }

  getResultGPU(epoch: number): void {
    this.perfResultService
      .getResultGPU(epoch, 0.98)
      .subscribe((result: PerformanceResult) => {
        this.gpu_result.push(result);
      });
  }

  pushTable(): void {
    const r = this.cpu_result[0].timing / this.gpu_result[0].timing;
    this.tableData.push({
      epoch: this.epochNum,
      cpu: this.cpu_result[0].timing,
      gpu: this.gpu_result[0].timing,
      rate: r
    });
    this.dataSource = new MatTableDataSource(this.tableData);
    this.cpu_result = [];
    this.gpu_result = [];
  }

  pushChart(): void {
    const len = this.chartOptions.xAxis.categories.length + 1;
    this.chartOptions.xAxis.categories.push(len);
    this.chartOptions.series[0].data.push(this.cpu_result[0].timing);
    this.chartOptions.series[1].data.push(this.gpu_result[0].timing);
    this.updateFlag = true;
  }

  ngOnInit() {}

  runSim() {
    this.getResultCPU(this.epochNum);
    this.getResultGPU(this.epochNum);
  }
}
