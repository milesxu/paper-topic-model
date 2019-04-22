import { Component, OnInit } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_wordcloud from 'highcharts/modules/wordcloud';
HC_wordcloud(Highcharts);
import { Word } from '../word';
import { WordsService } from '../words.service';

@Component({
  selector: 'app-word-cloud',
  templateUrl: './word-cloud.component.html',
  styleUrls: ['./word-cloud.component.css']
})
export class WordCloudComponent implements OnInit {
  word_data: Word[];
  Highcharts = Highcharts;
  updateFlag = false;
  chartOptions = {
    series: [
      {
        type: 'wordcloud',
        data: [],
        name: 'Occurrences'
      }
    ],
    title: {
      text: 'Wordcloud of Topic words'
    }
  };
  constructor(private wordService: WordsService) {}

  getWords(): void {
    this.wordService.getWords().subscribe((wordList: Word[]) => {
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
