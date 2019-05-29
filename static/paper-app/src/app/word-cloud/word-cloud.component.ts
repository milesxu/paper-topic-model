import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import HC_wordcloud from 'highcharts/modules/wordcloud';
HC_wordcloud(Highcharts);
import { WordsService, Word } from '../words.service';

@Component({
  selector: 'app-word-cloud',
  templateUrl: './word-cloud.component.html',
  styleUrls: ['./word-cloud.component.css']
})
export class WordCloudComponent implements OnInit {
  constructor(private wordService: WordsService, private router: Router) {}

  word_data: Word[];
  Highcharts = Highcharts;
  updateFlag = false;
  chartOptions = {
    series: [
      {
        type: 'wordcloud',
        data: [],
        name: 'Occurrences',
        events: {
          click: (event: Highcharts.SeriesClickEventObject) =>
            this.router.navigate([
              'papers',
              {
                topic: event.point.name
              }
            ])
        }
      }
    ],
    title: {
      text: 'Wordcloud of Topic words'
    }
  };

  // clickWord(event: Highcharts.SeriesClickEventObject) {
  //   console.log(event.point.name);
  //   this.router.navigate(['papers'], {
  //     queryParams: { topic: event.point.name }
  //   });
  // }

  getWords(): void {
    this.wordService.selectedWords.subscribe((wordList: Word[]) => {
      this.word_data = wordList;
      // this.chartOptions.series = [
      //   { type: 'wordcloud', data: this.word_data, name: 'Occurrences' }
      // ];
      this.chartOptions.series[0].data = this.word_data;
      this.updateFlag = true;
    });
  }

  ngOnInit() {
    this.getWords();
  }
}
