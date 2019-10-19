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
import { Subscription } from 'rxjs';

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
  // c2 and country name
  countryCode: CountryCode = {};
  // c2 and c3
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
  svg: any;
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
        // console.log(this.distribute[0]);
        this.initColorRank();
        this.fillMaps();
      },
      err => {
        console.log(err);
      },
      () => {}
    );
  }

  initColorRank() {
    this.distribute.sort((a, b) => {
      return a.value - b.value;
    });
    let idx = 0;
    while (this.distribute[idx].value === 0) {
      this.colorRank.set(this.distribute[idx].id, 0);
      ++idx;
    }
    const hasPaper = this.distribute.length - idx;
    const colorNum = this.colors.length - 1;
    const quotient = Math.floor(hasPaper / colorNum);
    const remainder = hasPaper % colorNum;
    for (let i = idx; i < this.distribute.length; ++i) {
      let dist = i - idx - 1;
      if (dist <= quotient + remainder) {
        this.colorRank.set(this.distribute[i].id, 1);
      } else {
        dist -= quotient + remainder;
        const bucket = Math.floor(dist / quotient);
        const rm = dist % quotient;
        if (rm === 0) {
          this.colorRank.set(this.distribute[i].id, bucket + 2);
        } else {
          this.colorRank.set(this.distribute[i].id, bucket + 3);
        }
      }
    }
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
    this.svg = d3.select('#maps');
    const path = d3.geoPath().projection(projection);

    // create map
    const map = this.svg.append('g');
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
          // console.log(d.id);
          if (!this.countryCode[d.id]) {
            console.log(d.id);
          }
          return d.id;
        })
        .attr('d', path)
        .on('click', (d: any, i) => {
          this.openDialog(d);
        })
        .on('mouseover', (d: any, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#2a5831');
          this.showTooltip(d, i);
          // console.log();
        })
        .on('mousemove', (d: any, i) => {
          this.showTooltip(d, i);
        })
        .on('mouseout', (d, i) => {
          const c = this.getFillColor(d);
          d3.select(d3.event.currentTarget).style('fill', c);
          this.hideTooltip(d, i);
        });
      this.fillMaps();
    });

    // create legend
    const legend = this.svg.append('g').attr('class', 'legend');

    legend
      .selectAll('rect')
      .data(this.colors)
      .join('rect')
      .attr('x', (d, i) => 50 + i * 25)
      .attr('y', 750)
      .attr('width', 24)
      .attr('height', 24)
      .attr('fill', (d, i) => d);

    const legendText = this.svg.append('g');
    legendText
      .selectAll('text')
      .data(['less', 'more'])
      .join('text')
      .attr('x', (d, i) => 23 + i * 427)
      .attr('y', 765)
      .text(d => d);
  }

  fillMaps() {
    this.svg
      .selectAll('path')
      .attr('stroke', 'gray')
      .attr('fill', (d: any): string => {
        // console.log(this.colorRank);
        return this.getFillColor(d);
      });
    // .attr('fill', '#e4e6d2');
  }

  openDialog(d: any) {
    const c2 = this.codeConvert[d.id];
    this.dialog.open(RankDialogComponent, {
      height: '480px',
      width: '720px',
      data: this.distributeService.getOrganizationRank(c2)
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
    // if (!this.countryCode[d.id]) { console.log(d.id); }
  }

  hideTooltip(d: any, i) {
    this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'none');
    this.renderer.setProperty(this.tooltip.nativeElement, 'innerHTML', '');
  }

  getFillColor(d: any) {
    const c2 = this.codeConvert[d.id];
    const val = this.colorRank.get(c2);
    if (!val) {
      return this.colors[0];
    }
    return this.colors[val];
  }

  /*hovered() {
    const cur = this;
    d3.select(cur).style('fill', '#2a5831');
  }*/
}
