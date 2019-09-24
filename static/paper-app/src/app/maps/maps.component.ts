import {
  Component,
  OnInit,
  AfterContentInit,
  Renderer2,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';
import * as d3 from 'd3';
import * as tpjs from 'topojson';
import {
  Distribute,
  DistributeService,
  OrganizationRank
} from '../distribute.service';
import { RankDialogComponent } from '../rank-dialog/rank-dialog.component';
import { Subscription, forkJoin } from 'rxjs';

export interface CountryCode {
  [code: string]: string;
}

export interface CodeConvert {
  [code: string]: string;
}

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild('tooltip', { static: false }) tooltip: ElementRef;
  private distSub: Subscription;
  distribute: Distribute[];
  // countryCode: Map<string, string> = new Map<string, string>();
  countryCode: CountryCode = {};
  codeConvert: CodeConvert = {};
  organizationRank: OrganizationRank = { country: '', ranks: [] };
  colorRank: Map<string, number> = new Map();
  colors = [
    '#e5e5e1',
    '#e5ead6',
    '#e6efbf',
    '#e4edb0',
    '#dbefa5',
    '#d3eda2',
    '#b8e5a8',
    '#8ad68a',
    '#76ce76',
    '#72c172',
    '#64af64',
    '#58a05a',
    '#4d9151',
    '#417f46',
    '#326638',
    '#2a5831'
  ];
  constructor(
    private renderer: Renderer2,
    private distributeService: DistributeService,
    private http: HttpClient,
    public dialog: MatDialog
  ) {}

  getDistribute(): void {
    this.distSub = this.distributeService.distribute$.subscribe(
      (dists: Distribute[]) => {
        this.distribute = dists;
        console.log(this.distribute[0]);
      },
      err => {
        console.log(err);
      },
      () => {}
    );
  }

  getCountrycode(): void {
    this.http.get<any[]>('assets/country-code.json').subscribe(result => {
      // result.forEach(r => (this.countryCode[r.alpha3] = r.name));
      result.forEach(r => {
        // this.countryCode.set(r.alpha3, r.name);
        // console.log(this.countryCode.get(r.alpha3));
        this.countryCode[r.c3] = r.name;
        this.codeConvert[r.c3] = r.c2;
      });
    });
  }

  getFillingColor(d: any, i: number) {}

  fillBucket() {
    const maxPaperNum = Math.max(...this.distribute.map(d => d.value));
    let quantile: number;
    if (maxPaperNum <= 16) {
      quantile = 1;
    } else {
      quantile = maxPaperNum / 16;
    }
    this.distribute.forEach(d =>
      this.colorRank.set(d.id, Math.floor(quantile * d.value))
    );
  }

  ngOnInit() {
    this.distribute = this.distributeService.distribute;
    this.getDistribute();
    this.getCountrycode();
  }

  ngOnDestroy() {
    this.distSub.unsubscribe();
  }

  ngAfterContentInit() {
    /*console.log(this.countryCode);
    const arr = Array.from(this.countryCode.keys());
    console.log(arr.length);*/
    const width = 1570;
    const height = 900;
    const projection = d3
      .geoEquirectangular()
      // .center([0, -30])
      .scale(width / (2 * Math.PI))
      .translate([width / 2, height / 2]);
    const svg = d3.select('#maps');
    const path = d3.geoPath().projection(projection);

    // create map
    const map = svg.append('g');
    map.attr('class', 'map');
    d3.json('assets/countries.topo.json').then((us: any) => {
      map
        .append('g')
        .attr('id', 'countries')
        .selectAll('path')
        .data(tpjs.feature(us, us.objects.countries).features)
        // .enter()
        // .append('path')
        .join('path')
        .attr('id', (d: any) => {
          // console.log(d);
          return d.id;
        })
        .attr('d', path)
        .on('click', (d, i) => {
          this.openDialog();
        })
        .on('mouseover', (d: any, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#2a5831');
          this.showTooltip(d, i);
          console.log();
        })
        .on('mousemove', (d: any, i) => {
          this.showTooltip(d, i);
        })
        .on('mouseout', (d, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#e4e6d2');
          this.hideTooltip(d, i);
        });

      svg
        .selectAll('path')
        .attr('stroke', 'gray')
        .attr('fill', '#e4e6d2');
    });

    // create legend
    const legend = svg.append('g').attr('class', 'legend');

    legend
      .selectAll('rect')
      .data(this.colors)
      .join('rect')
      .attr('x', (d, i) => 50 + i * 25)
      .attr('y', 750)
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', (d, i) => d);

    const legendText = svg.append('g');
    legendText
      .selectAll('text')
      .data(['less', 'more'])
      .join('text')
      .attr('x', (d, i) => 23 + i * 427)
      .attr('y', 765)
      .text(d => d);
  }

  openDialog() {
    this.dialog.open(RankDialogComponent, {
      height: '480px',
      width: '720px',
      data: this.organizationRank
    });
  }

  showTooltip(d: any, i) {
    // console.log(d3.event.pageX, d3.event.pageY);
    this.renderer.setStyle(
      this.tooltip.nativeElement,
      'top',
      `${d3.event.pageY}px`
    );
    this.renderer.setStyle(
      this.tooltip.nativeElement,
      'left',
      `${d3.event.pageX - 300}px`
    );
    this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'block');
    this.renderer.setProperty(
      this.tooltip.nativeElement,
      'innerHTML',
      this.countryCode[d.id]
    );
  }

  hideTooltip(d: any, i) {
    this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'none');
    this.renderer.setProperty(this.tooltip.nativeElement, 'innerHTML', '');
  }

  /*hovered() {
    const cur = this;
    d3.select(cur).style('fill', '#2a5831');
  }*/
}
