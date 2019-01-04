import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import * as am4core from '@amcharts/amcharts4/core';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';
import * as am4maps from '@amcharts/amcharts4/maps';
import am4geodata_worldHigh from '@amcharts/amcharts4-geodata/worldHigh';
import { Distribute } from '../distribute';
import { DistributeService } from '../distribute.service';

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, AfterViewInit, OnDestroy {
  private chart: am4maps.MapChart;
  distribute: Distribute[];
  constructor(
    private zone: NgZone,
    private distributeService: DistributeService
  ) {}

  getDistribute(): void {
    this.distributeService.getDistribute().subscribe(
      (dists: Distribute[]) => {
        this.distribute = dists;
      },
      err => {
        console.log(err);
      },
      () => {
        this.zone.runOutsideAngular(() => {
          const chart = am4core.create('chartdiv', am4maps.MapChart);
          chart.geodata = am4geodata_worldHigh;
          chart.projection = new am4maps.projections.Miller();

          const wordSeries = chart.series.push(new am4maps.MapPolygonSeries());
          wordSeries.exclude = ['AQ'];
          wordSeries.useGeodata = true;
          wordSeries.data = this.distribute;

          wordSeries.heatRules.push({
            property: 'fill',
            target: wordSeries.mapPolygons.template,
            min: am4core.color('#ffffff'),
            max: am4core.color('#AAAA00'),
            minValue: 0,
            maxValue: 600
          });

          this.chart = chart;
        });
      }
    );
  }

  ngAfterViewInit(): void {
    this.getDistribute();
  }

  ngOnInit() {
    // this.getDistribute();
  }

  ngOnDestroy(): void {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
}
