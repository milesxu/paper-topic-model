import { Component, OnInit } from "@angular/core";
import { PageEvent } from "@angular/material/paginator";
import { Paper } from "../paper";
import { StatisticService } from "../statistic.service";

@Component({
  selector: "app-papers",
  templateUrl: "./papers.component.html",
  styleUrls: ["./papers.component.css"]
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

  constructor(private statisticService: StatisticService) {
    /*conferencesService.selectedConferences.subscribe(
      conferences => (this.selectedConferences = conferences)
    );*/
  }

  // filterPapers(): void {
  //   if (this.allPapers && this.selectedConferences) {
  //     this.papers = this.allPapers.filter(paper =>
  //       this.selectedConferences.includes(paper.conference)
  //     );
  //   } else {
  //     this.papers = [];
  //   }
  // }

  getPapers(): void {
    this.statisticService.selectedPapers.subscribe((paperList: Paper[]) => {
      this.papers = paperList;
      this.length = this.papers.length;
      this.papersInPage = this.papers.slice(0, this.pageSize);
    });
  }

  // getConferences(): void {
  //   this.statisticService.selectedConferences.subscribe(conferences => {
  //     this.selectedConferences = conferences;
  //     this.filterPapers();
  //   });
  // }

  ngOnInit() {
    // this.getConferences();
    this.getPapers();
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
