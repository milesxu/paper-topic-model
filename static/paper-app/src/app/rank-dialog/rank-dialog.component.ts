import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { OrganizationRank } from '../organization-rank';
// import * as am4core from '@amcharts/amcharts4/core';
// import am4themes_animated from '@amcharts/amcharts4/themes/animated';
// import * as am4charts from '@amcharts/amcharts4/charts';
import * as Highcharts from 'highcharts';

// am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-rank-dialog',
  templateUrl: './rank-dialog.component.html',
  styleUrls: ['./rank-dialog.component.css']
})
export class RankDialogComponent implements OnInit {
  // private chart: am4charts.XYChart;
  Highcharts = Highcharts;
  updateFlag = false;
  chartOptions = {
    chart: {
      type: 'bar'
    },
    xAxis: {
      categories: []
    },
    yAxis: {
      title: null
    },
    series: [
      {
        name: 'Number of Papers',
        data: []
      }
    ],
    title: null
  };
  constructor(@Inject(MAT_DIALOG_DATA) public data: OrganizationRank) {}

  ngOnInit() {
    // const chart = am4core.create('chartdiv', am4charts.XYChart);
    // this.chart = chart;
    const cat = [];
    const paper = [];
    this.data.ranks.forEach(r => {
      cat.push(r.organization);
      paper.push(r.papers);
    });
    this.chartOptions.xAxis.categories = cat;
    this.chartOptions.series[0].data = paper;
  }
}
