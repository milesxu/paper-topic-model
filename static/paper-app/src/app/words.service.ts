import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Word } from './word';

@Injectable({
  providedIn: 'root'
})
export class WordsService {
  constructor(private http: HttpClient) {}

  getWords() {
    return this.http.get<Word[]>('assets/nips_result.json');
  }
}
