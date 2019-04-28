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

          const title = chart.chartContainer.createChild(am4core.Label);
          title.text = 'Paper distribution in the world';
          title.fontSize = 20;
          title.align = 'center';
          title.paddingTop = 30;
          title.zIndex = 100;

          const wordSeries = chart.series.push(new am4maps.MapPolygonSeries());
          wordSeries.exclude = ['AQ'];
          wordSeries.useGeodata = true;
          wordSeries.data = this.distribute;

          const template = wordSeries.mapPolygons.template;
          template.tooltipText = '{name}: {value}';

          wordSeries.heatRules.push({
            property: 'fill',
            target: wordSeries.mapPolygons.template,
            // min: am4core.color('#ffffff'),
            min: am4core.color('#eeeeee'),
            // max: am4core.color('#AAAA00')
            // max: am4core.color('#74B266')
            max: am4core.color('#3F51B5')
          });

          const legend = chart.createChild(am4maps.HeatLegend);
          legend.series = wordSeries;
          legend.width = am4core.percent(80);
          legend.align = 'center';
          legend.valign = 'bottom';

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
