import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  AfterContentInit
} from '@angular/core';
// import { MatTableDataSource } from '@angular/material';
import * as d3 from 'd3';
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
export class PerformanceComponent
  implements OnInit, OnDestroy, AfterContentInit {
  listArray = Array(6).fill(0);
  selectedSubject = 'lntm_train';
  selectedDataset = 'nips2018';
  epochNum = 6;
  cpuResult: PerformanceResult[] = [];
  gpuResult: PerformanceResult[] = [];
  svg: any;
  margin = { top: 10, right: 0, left: 30, bottom: 30 };
  // column_string: string[] = ['epoch', 'cpu', 'gpu', 'rate'];
  // tableData: ResultCompare[] = [];
  // dataSource = new MatTableDataSource(this.tableData);
  updateFlag = false;
  /*chartOptions = {
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
  };*/
  cpuSub: Subscription;
  gpuSub: Subscription;
  completeSub: Subscription;
  constructor(
    private performanceService: PerformanceService,
    private stateService: StateService
  ) {
    stateService.openSideUpdate(false);
    performanceService.connected.subscribe(text => console.log(text));
  }

  getResultCPU(epoch: number): void {
    this.performanceService.cpu_test(this.selectedDataset, this.epochNum);
  }

  getResultGPU(epoch: number): void {
    // this.performanceService.gpu_test();
  }

  pushTable(epoch, cpu, gpu): void {
    const r = cpu / gpu;
    /*this.tableData.push({
      epoch,
      cpu,
      gpu,
      rate: r
    });*/
    // this.dataSource = new MatTableDataSource(this.tableData);
  }

  pushChart(cpu, gpu): void {
    // const len = this.chartOptions.xAxis.categories.length + 1;
    // this.chartOptions.xAxis.categories.push(len);
    // this.chartOptions.series[0].data.push(cpu);
    // this.chartOptions.series[1].data.push(gpu);
    // this.updateFlag = true;
  }

  ngOnInit() {
    this.cpuSub = this.performanceService.cpu.subscribe(perf => {
      this.cpuResult.push(perf);
    });
    this.gpuSub = this.performanceService.gpu.subscribe(perf => {
      this.gpuResult.push(perf);
    });
    this.completeSub = this.performanceService.complete.subscribe(c => {
      this.resultAnalysis();
    });
  }

  ngAfterContentInit() {
    this.svg = d3.select('#bar-chart');
  }

  ngOnDestroy() {
    this.cpuSub.unsubscribe();
    this.gpuSub.unsubscribe();
    this.completeSub.unsubscribe();
  }

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
    console.log(this.cpuResult);
    console.log(this.gpuResult);
    const epoch = this.epochNum;
    let cpuTime = this.cpuResult.reduce((t, cr) => {
      return t + cr.timing;
    }, 0);
    cpuTime /= epoch;
    let gpuTime = this.gpuResult.reduce((t, gr) => {
      return t + gr.timing;
    }, 0);
    gpuTime /= epoch;
    // this.pushTable(epoch, cpuTime, gpuTime);
    // this.pushChart(cpuTime, gpuTime);
    // this.cpu_result = [];
    // this.gpu_result = [];
  }

  isEven(i: number) {
    return i % 2 === 0;
  }
}
