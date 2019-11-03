import {
  Component,
  OnInit,
  AfterContentInit,
  Renderer2,
  ViewChild,
  ElementRef
} from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import * as d3 from 'd3';
import * as cloud from 'd3-cloud';
import { WordsService, Word } from '../words.service';
import { StateService } from '../state.service';

enum DisplayType {
  wordcloud,
  grid,
  list
}

@Component({
  selector: 'app-word-cloud',
  templateUrl: './word-cloud.component.html',
  styleUrls: ['./word-cloud.component.css']
})
export class WordCloudComponent implements OnInit, AfterContentInit {
  @ViewChild('tooltip', { static: false }) tooltip: ElementRef;
  layout: any;
  wordData: Word[];
  layoutWords: any[];
  displayType: DisplayType = DisplayType.wordcloud;
  // svg: any;
  svgWidth = 1500;
  svgHeight = 800;
  colors = [
    '#a7adad',
    '#465e79',
    '#8aa5c6',
    '#a0d8c5',
    '#f9ce64',
    '#eea372',
    '#f65a5d',
    '#974b5a'
  ];
  constructor(
    private renderer: Renderer2,
    private wordService: WordsService,
    private router: Router,
    private stateService: StateService,
    iconRegistry: MatIconRegistry,
    santinizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      'wordcloud',
      santinizer.bypassSecurityTrustResourceUrl('assets/wordcloud.svg')
    );
    iconRegistry.addSvgIcon(
      'grid',
      santinizer.bypassSecurityTrustResourceUrl('assets/grid.svg')
    );
    iconRegistry.addSvgIcon(
      'list',
      santinizer.bypassSecurityTrustResourceUrl('assets/list.svg')
    );
  }

  ngOnInit() {
    // this.layout = cloud().size([1500, 800]);

    this.getWords();
    // this.wordData = this.wordService.word;
    // this.chartOptions.series[0].data = this.word_data;
    // this.updateFlag = true;
    this.stateService.singleCheckUpdate(true);
  }

  ngAfterContentInit() {}

  drawWordCloud() {
    this.layout = cloud()
      // cloud()
      .size([this.svgWidth, this.svgHeight])
      .words(
        // this.wordData.slice(0, 500).map(d => {
        this.wordData.map((d, i) => {
          return {
            text: d.name,
            size: 12 + d.weight * 4,
            occurrence: d.weight
            // test: 'haha'
          };
        })
      )
      .padding(2)
      .rotate(0)
      // .rotate(() => {
      // return ~~(Math.random() * 2) * 90;
      // return Math.floor(Math.random() * 2) * 90;
      // })
      .font('Impact')
      .fontSize(d => {
        return d.size;
      })
      // .spiral([0, 0])
      .on('end', this.draw);
    // .on('end', (t, s) => {
    //   this.layoutWords = t;
    //   console.log(this.layoutWords);
    // })
    // .start();
    this.layout.start();
  }

  getWords(): void {
    this.wordService.selectedWords.subscribe((wordList: Word[]) => {
      this.wordData = wordList;
      // this.chartOptions.series = [
      //   { type: 'wordcloud', data: this.word_data, name: 'Occurrences' }
      // ];
      // this.chartOptions.series[0].data = this.word_data;
      // this.updateFlag = true;
      // console.log(this.layout);
      this.drawWordCloud();
    });
  }

  draw = words => {
    // console.log('draw function called');
    // this.svg
    d3.select('#words')
      .select('svg')
      .remove();
    d3.select('#words')
      .append('svg')
      .attr('width', this.svgWidth)
      .attr('height', this.svgHeight)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.svgWidth / 2 + ',' + this.svgHeight / 2 + ')'
      )
      .selectAll('text')
      .data(words)
      .join('text')
      .style('font-size', (d: any) => {
        return d.size + 'px';
      })
      .style('font-family', 'Impact')
      .style('fill', (d, i) => this.colors[i % this.colors.length])
      .attr('text-anchor', 'middle')
      .attr('transform', (d: any) => {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text((d: any) => {
        return d.text;
      })
      .on('mouseover', (d: any) => {
        this.showTooltip(d);
      })
      .on('mouseout', (d: any) => {
        this.hideTooltip();
      })
      .on('click', (d: any) => {
        this.gotoPapers(d.text);
      });
  }

  iseven(i: number) {
    return i % 2 === 0;
  }

  getDisplayType(typeStr: string) {
    const type: DisplayType = DisplayType[typeStr];
    return type === this.displayType;
  }

  changeDisplayType(typeStr: string) {
    this.displayType = DisplayType[typeStr];
    // if (typeStr === 'wordcloud') {
    //   console.log(d3.select('#words'));
    //   console.log('try to draw wordcloud');
    //   this.drawWordCloud();
    //   this.layout.start();
    // }
  }

  gTransform() {
    const w = this.svgWidth / 2;
    const h = this.svgHeight / 2;
    return `translate(${w},${h})`;
  }

  showTooltip(d: any) {
    let xStart = 0;
    if (d3.event.pageX > 1600) {
      xStart = d3.event.pageX - 550;
    } else {
      xStart = d3.event.pageX - 330;
    }
    this.renderer.setStyle(
      this.tooltip.nativeElement,
      'top',
      `${d3.event.pageY - 100}px`
    );
    this.renderer.setStyle(this.tooltip.nativeElement, 'left', `${xStart}px`);
    this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'block');
    this.renderer.setProperty(
      this.tooltip.nativeElement,
      'innerHTML',
      `weight of ${d.text}: ${d.occurrence}`
    );
  }

  hideTooltip() {
    this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'none');
    this.renderer.setProperty(this.tooltip.nativeElement, 'innerHTML', '');
  }

  gotoPapers(topic: string) {
    this.router.navigate(['papers', { topic }]);
  }
}
