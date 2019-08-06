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
  [key: string]: number;
  cpu: number;
  gpu: number;
  // ratio: number;
}

@Component({
  selector: 'app-performance',
  templateUrl: './performance.component.html',
  styleUrls: ['./performance.component.css']
})
export class PerformanceComponent
  implements OnInit, OnDestroy, AfterContentInit {
  constructor(
    private performanceService: PerformanceService,
    private stateService: StateService
  ) {
    stateService.openSideUpdate(false);
    performanceService.connected.subscribe(text => console.log(text));
  }
  listArray = Array(6).fill(0);
  selectedSubject = 'lntm_train';
  selectedDataset = 'nips2018';
  epochNum = 5;
  cpuResult: PerformanceResult[] = [];
  gpuResult: PerformanceResult[] = [];
  resultCompare: TimeCompare[] = [];
  svg: any;
  svgWidth = 1000;
  svgHeight = 320;
  margin = { top: 20, right: 30, left: 60, bottom: 10 };
  turns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  totalTime = 5;
  curRatio = -1;
  allColors = [
    '#465e79',
    '#f9ce64',
    '#465e79',
    '#a0d8c5',
    '#974b5a',
    '#eea372',
    '#F65a5d',
    '#f9ce64',
    '#974b5a',
    '#8aa5c6',
    '#974b5a',
    '#a0d8c5',
    '#465e79',
    '#eea372',
    '#465e79',
    '#f65a5d'
  ];
  barChartColors = ['#465e79', '#a0d8c5'];
  stackName = ['cpu', 'gpu'];
  cpuSub: Subscription;
  gpuSub: Subscription;
  completeSub: Subscription;

  getResultCPU(epoch: number): void {
    this.performanceService.cpu_test(this.selectedDataset, this.epochNum);
  }

  getResultGPU(epoch: number): void {
    // this.performanceService.gpu_test();
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
    this.drawBarChart();
  }

  drawBarChart(): void {
    d3.selectAll('#bar-chart > *').remove();

    const y = d3
      .scaleBand()
      .domain(this.turns)
      .range([this.margin.top, this.svgHeight - this.margin.bottom])
      .padding(0.1);
    const yAxis = g =>
      g
        .attr('transform', `translate(${this.margin.left},0)`)
        .call(d3.axisLeft(y).tickSizeOuter(0));
    this.svg.append('g').call(yAxis);

    const x = d3
      .scaleLinear()
      .domain([0, this.totalTime])
      .range([this.margin.left, this.svgWidth - this.margin.right]);

    const xAxis = g =>
      g
        .attr('transform', `translate(0,${this.margin.top})`)
        .call(d3.axisTop(x).ticks(this.svgWidth / 80));
    // .call(g => g.select('.domain').remove());

    this.svg.append('g').call(xAxis);

    this.svg
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', this.margin.left / 4)
      .attr('x', 0 - this.svgHeight / 2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('History Records');

    if (this.resultCompare) {
      const z = d3
        .scaleOrdinal()
        .range(this.barChartColors)
        .domain(this.stackName);

      const series = d3.stack().keys(this.stackName)(this.resultCompare);
      console.log(series);

      this.svg
        .append('g')
        .selectAll('g')
        .data(series)
        .join('g')
        .attr('fill', d => z(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('y', (d, i) => y(i + 1))
        .attr('x', d => x(d[0]))
        .attr('width', d => x(d[1]) - x(d[0]))
        .attr('height', y.bandwidth());

      this.svg
        .append('g')
        .selectAll('g')
        .data(series[0])
        .join('g')
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .style('font', '12px sans-serif')
        .append('text')
        .data(series[0])
        // .selectAll('text')
        // .join('text')
        .attr('x', d => x(d[0]) + 50)
        .attr('y', (d, i) => y(i + 1) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        // .text(d => d[1] - d[0]);
        .text(d => `cpu time: ${(d[1] - d[0]).toFixed(2)}`);

      this.svg
        .append('g')
        .selectAll('g')
        .data(series[1])
        .join('g')
        .attr('fill', 'white')
        .attr('text-anchor', 'middle')
        .style('font', '12px sans-serif')
        .append('text')
        .data(series[1])
        // .selectAll('text')
        // .join('text')
        .attr('x', d => x(d[0]) + 50)
        .attr('y', (d, i) => y(i + 1) + y.bandwidth() / 2)
        .attr('dy', '0.35em')
        // .text(d => d[1] - d[0]);
        .text(d => `gpu time: ${(d[1] - d[0]).toFixed(2)}`);
    }
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
    // console.log(this.cpuResult);
    // console.log(this.gpuResult);
    // const epoch = this.epochNum;
    let cpuTime = this.cpuResult.reduce((t, cr) => {
      return t + cr.timing;
    }, 0);
    cpuTime /= this.cpuResult.length;
    let gpuTime = this.gpuResult.reduce((t, gr) => {
      return t + gr.timing;
    }, 0);
    gpuTime /= this.gpuResult.length;
    this.compareUpdate(cpuTime, gpuTime);
    this.drawBarChart();
    this.cpuResult = [];
    this.gpuResult = [];
  }

  compareUpdate(cpuTime: number, gpuTime: number) {
    if (this.resultCompare.length === 10) {
      this.resultCompare.shift();
    }
    this.resultCompare.push({
      cpu: cpuTime,
      gpu: gpuTime
    });
    const ratio = cpuTime / gpuTime;
    if (this.curRatio < ratio) {
      this.curRatio = ratio;
    }
  }

  get maxRatio() {
    // return Math.max(...this.resultCompare.map(r => r.ratio));
    return this.curRatio;
  }

  isEven(i: number) {
    return i % 2 === 0;
  }
}
