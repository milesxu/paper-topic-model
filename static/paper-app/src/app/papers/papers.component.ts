import { Component, OnInit, OnDestroy } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Paper, PaperService } from '../paper.service';

@Component({
  selector: 'app-papers',
  templateUrl: './papers.component.html',
  styleUrls: ['./papers.component.css']
})
export class PapersComponent implements OnInit {
  length = 0;
  allPapers: Paper[] = [];
  papers: Paper[];
  papersInPage: Paper[];
  pageSize = 10;
  pageSizeOptions = [10, 25, 50, 100];
  current = 1;
  selectedConferences = [];
  sub: any;

  constructor(
    private route: ActivatedRoute,
    private paperService: PaperService
  ) {}

  getPapers(): void {
    this.paperService.papers$.subscribe((paperList: Paper[]) => {
      this.papers = paperList;
      this.length = this.papers.length;
      this.papersInPage = this.papers.slice(0, this.pageSize);
      // console.log(this.papers.length);
    });
  }

  ngOnInit() {
    this.getPapers();
    this.route.paramMap.subscribe(p => {
      const topic = p.has('topic') ? p.get('topic') : '';
      // console.log(topic);
      /*if (topic) {
        this.paperService.getPaperByTopic([topic]);
        // this.length = this.papers.length;
        // this.papersInPage = this.papers.slice(0, this.pageSize);
      }*/
      this.paperService.changeTopic([topic]);
    });
  }

  pageEvent(event: PageEvent): void {
    // console.log(event.pageIndex, event.length, event.pageSize);
    let startIndex: number, endIndex: number;
    startIndex = event.pageIndex * event.pageSize;
    endIndex = Math.min(startIndex + event.pageSize, event.length);
    if (endIndex - startIndex < event.pageSize) {
      startIndex = endIndex - event.pageSize;
    }
    this.papersInPage = this.papers.slice(startIndex, endIndex);
  }
}
