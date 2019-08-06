import { Component, OnInit, AfterContentInit } from '@angular/core';
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
  layout: any;
  wordData: Word[];
  layoutWords: any[];
  displayType: DisplayType = DisplayType.wordcloud;
  svgWidth = 1500;
  svgHeight = 800;
  constructor(
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
      .size([this.svgWidth, this.svgHeight])
      .words(
        // this.wordData.slice(0, 500).map(d => {
        this.wordData.map(d => {
          return {
            text: d.name,
            size: 9 + Math.random() * d.weight * 10,
            test: 'haha'
          };
        })
      )
      // .padding(5)
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
      // .on('end', this.draw)
      .on('end', (t, s) => {
        this.layoutWords = t;
        console.log(this.layoutWords);
      });
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
    d3.select('#words')
      .append('svg')
      .attr('width', this.layout.size()[0])
      .attr('height', this.layout.size()[1])
      .append('g')
      .attr(
        'transform',
        'translate(' +
          this.layout.size()[0] / 2 +
          ',' +
          this.layout.size()[1] / 2 +
          ')'
      )
      .selectAll('text')
      .data(words)
      .enter()
      .append('text')
      .style('font-size', (d: any) => {
        return d.size + 'px';
      })
      .style('font-family', 'Impact')
      .attr('text-anchor', 'middle')
      .attr('transform', (d: any) => {
        return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')';
      })
      .text((d: any) => {
        return d.text;
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
  }

  gTransform() {
    const w = this.svgWidth / 2;
    const h = this.svgHeight / 2;
    return `translate(${w},${h})`;
  }
}
