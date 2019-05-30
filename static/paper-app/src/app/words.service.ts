import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, forkJoin } from 'rxjs';
import { ConferenceService } from './conference.service';
export class Word {
  name: string;
  weight: number;
}

@Injectable({
  providedIn: 'root'
})
export class WordsService {
  private wordSource = new BehaviorSubject<Word[]>([]);
  selectedWords: Observable<Word[]> = this.wordSource.asObservable().skip(1);
  private confWords: { conference: string; word: Word[] }[] = [];
  constructor(
    private http: HttpClient,
    private conferenceService: ConferenceService
  ) {
    this.getWords();
  }

  getWords() {
    forkJoin({
      nips2018: this.http.get<Word[]>('assets/nips2018_word_cloud.json'),
      iclr2019: this.http.get<Word[]>('assets/iclr2019_word_cloud.json'),
      icml2018: this.http.get<Word[]>('assets/icml2018_word_cloud.json'),
      cvpr2018: this.http.get<Word[]>('assets/cvpr2018_word_cloud.json')
    }).subscribe(result => {
      this.confWords = [
        { conference: 'NeurIPS2018', word: result.nips2018 },
        { conference: 'ICLR2019', word: result.iclr2019 },
        { conference: 'ICML2018', word: result.icml2018 },
        { conference: 'CVPR2018', word: result.cvpr2018 }
      ];
      this.wordSource.next(this.computeWord('NeurIPS2018'));
      this.updateWords();
    });
  }

  get word() {
    return this.wordSource.getValue();
  }

  computeWord(conference: string): Word[] {
    console.log(conference);
    return this.confWords.find(cw => cw.conference === conference).word;
  }

  updateWords() {
    this.conferenceService.conferences$.subscribe(conf => {
      console.log(conf);
      this.wordSource.next(this.computeWord(conf[conf.length - 1]));
    });
  }
}
