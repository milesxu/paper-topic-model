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
    const width = document.documentElement.clientWidth * 0.85;
    const height = document.documentElement.clientWidth * 0.7;
    const projection = d3
      .geoMercator()
      .scale(height / (2 * Math.PI))
      .translate([width / 2, height / 2]);
    const svg = d3.select('#maps');
    // .append('svg');
    // .attr('width', '100%')
    // .attr('height', height * 4);
    const path = d3.geoPath().projection(projection);
    const g = svg.append('g');
    g.attr('class', 'map');
    console.log(svg);
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
        .on('click', this.clicked);
      /*svg
        .selectAll('path')
        .data(tpjs.feature(world, world.objects.countries).features)
        .enter()
        .append('path')
        .attr('d', path);*/
      svg
        .selectAll('path')
        .attr('stroke', 'gray')
        .attr('fill', '#E6E9D4');
    });
  }

  clicked(event: any) {}
}
