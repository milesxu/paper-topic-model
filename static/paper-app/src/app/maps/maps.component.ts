import { Component, OnInit, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';
import * as tpjs from 'topojson';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements OnInit, AfterContentInit {
  constructor() {}

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
        .on('click', this.clicked)
        .on('mouseover', (d, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#2a5831');
        })
        .on('mouseout', (d, i) => {
          d3.select(d3.event.currentTarget).style('fill', '#e4e6d2');
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

  clicked(event: any) {}

  /*hovered() {
    const cur = this;
    d3.select(cur).style('fill', '#2a5831');
  }*/
}
