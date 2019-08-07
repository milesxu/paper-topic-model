import {
  Component,
  OnInit,
  AfterContentInit,
  Renderer2,
  ViewChild,
  ElementRef
} from '@angular/core';
import { MatDialog } from '@angular/material';
import * as d3 from 'd3';
import * as tpjs from 'topojson';
import {
  Distribute,
  DistributeService,
  OrganizationRank
} from '../distribute.service';
import { RankDialogComponent } from '../rank-dialog/rank-dialog.component';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, AfterContentInit {
  @ViewChild('tooltip', { static: false }) tooltip: ElementRef;
  organizationRank: OrganizationRank = { country: '', ranks: [] };
  constructor(
    private renderer: Renderer2,
    private distributeService: DistributeService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {}

  ngAfterContentInit() {
    const width = 1570;
    const height = 900;
    const projection = d3
      .geoEquirectangular()
      // .center([0, -30])
      .scale(width / (2 * Math.PI))
      .translate([width / 2, height / 2]);
    const svg = d3.select('#maps');
    const path = d3.geoPath().projection(projection);
    const g = svg.append('g');
    g.attr('class', 'map');
    d3.json('assets/countries.topo.json').then((us: any) => {
      g.append('g')
        .attr('id', 'countries')
        .selectAll('path')
        .data(tpjs.feature(us, us.objects.countries).features)
        .enter()
        .append('path')
        .attr('id', (d: any) => {
          return d.id;
        })
        .attr('d', path)
        .on('click', (d, i) => {
          this.openDialog();
        })
        .on('mouseover', (d: any, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#2a5831');
          this.showTooltip(d, i);
        })
        .on('mousemove', (d: any, i) => {
          this.showTooltip(d, i);
        })
        .on('mouseout', (d, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#e4e6d2');
          this.hideTooltip(d, i);
        });
      /*svg
        .selectAll('path')
        .data(tpjs.feature(world, world.objects.countries).features)
        .enter()
        .append('path')
        .attr('d', path);*/
      svg
        .selectAll('path')
        .attr('stroke', 'gray')
        .attr('fill', '#e4e6d2');
    });
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
    // const e = d3.event as MouseEvent;
    // console.log(e.p)
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
    // this.renderer.setStyle(this.tooltip.nativeElement, 'position', 'absolute');
    this.renderer.setProperty(
      this.tooltip.nativeElement,
      'innerHTML',
      d.properties.name
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
