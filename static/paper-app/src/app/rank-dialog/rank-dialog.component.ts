import { Component, OnInit, Inject, AfterContentInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { OrganizationRank } from '../distribute.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-rank-dialog',
  templateUrl: './rank-dialog.component.html',
  styleUrls: ['./rank-dialog.component.css']
})
export class RankDialogComponent implements OnInit, AfterContentInit {
  totalPapers = 500;
  svg: any;
  svgWidth = 640;
  svgHeight = 370;
  margin = { top: 20, right: 30, left: 60, bottom: 10 };
  turns = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  constructor(@Inject(MAT_DIALOG_DATA) public data: OrganizationRank) {}

  getPaperLimit(paper: number[]) {
    const maxPaperNum = Math.max(...paper);
    // console.log(maxPaperNum);
    const tens = Math.floor(maxPaperNum / 10);
    const rem = maxPaperNum % 10;
    if (rem === 0) {
      this.totalPapers = maxPaperNum;
    } else {
      this.totalPapers = (tens + 1) * 10;
    }
    // console.log(this.totalPapers);
  }

  ngOnInit() {
    const cat = [];
    const paper = [];
    this.data.ranks.forEach(r => {
      cat.push(r.organization);
      paper.push(r.papers);
    });
    this.getPaperLimit(paper);
    // console.log(this.data);
  }

  ngAfterContentInit() {
    this.svg = d3.select('#rank-chart');
    this.drawBarChart();
  }

  drawBarChart() {
    d3.selectAll('#rank-chart > *').remove();

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
      .domain([0, this.totalPapers])
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
      .text('Top Contributors');

    this.svg
      .append('g')
      .selectAll('rect')
      .data(this.data.ranks)
      .join('rect')
      .attr('y', (d, i) => y(i + 1))
      .attr('x', d => x(0))
      .attr('width', d => x(d.papers) - x(0))
      .attr('height', y.bandwidth())
      .attr('fill', '#a0d8c5');

    this.svg
      .append('g')
      .selectAll('text')
      .data(this.data.ranks)
      .join('text')
      .attr('y', (d, i) => y(i + 1) + y.bandwidth() / 2)
      .attr('x', d => x(0) + 10)
      .style('alignment-baseline', 'middle')
      .text(d => d.organization + '  ' + d.papers);
  }
}
