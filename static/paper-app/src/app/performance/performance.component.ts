import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { PerformanceService, PerformanceResult } from '../performance.service';
import { StateService } from '../state.service';
import { Subscription } from 'rxjs';

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
export class PerformanceComponent implements OnInit, OnDestroy {
  listArray = Array(6).fill(0);
  selectedSubject = 'lntm_train';
  selectedDataset = 'nips2018';
  epochNum = 6;
  cpu_result: PerformanceResult[] = [];
  gpu_result: PerformanceResult[] = [];
  column_string: string[] = ['epoch', 'cpu', 'gpu', 'rate'];
  tableData: ResultCompare[] = [];
  dataSource = new MatTableDataSource(this.tableData);
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
  cpu_sub: Subscription;
  gpu_sub: Subscription;
  complete_sub: Subscription;
  constructor(
    private performanceService: PerformanceService,
    private stateService: StateService
  ) {
    stateService.openSideUpdate(false);
  }

  getResultCPU(epoch: number): void {
    this.performanceService.cpu_test(this.selectedDataset, this.epochNum);
  }

  getResultGPU(epoch: number): void {
    // this.performanceService.gpu_test();
  }

  pushTable(epoch, cpu, gpu): void {
    const r = cpu / gpu;
    this.tableData.push({
      epoch,
      cpu,
      gpu,
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
  ngOnInit() {}

  ngOnDestroy() {}

  runSim() {
    this.getResultCPU(this.epochNum);
    this.getResultGPU(this.epochNum);
  }

  consumeTest() {
    /*this.performanceService.consumed.subscribe(i => {
      // console.log(i);
      this.gpu_result.push({
        count: i,
        timing: i,
        perplexity: i
      });
      console.log(i);
    });
    this.performanceService.consume();*/
  }

  resultAnalysis() {
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
  }

  isEven(i: number) {
    return i % 2 === 0;
  }
}
