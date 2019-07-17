import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { Paper, PaperService } from '../paper.service';
declare var MathJax: any;

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.component.html',
  styleUrls: ['./paper-detail.component.css']
})
export class PaperDetailComponent implements OnInit, AfterViewInit {
  @Input() paper: Paper;
  @ViewChild('equantions', { static: false }) equations: ElementRef;
  constructor() {}

  ngAfterViewInit(): void {
    // Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
    // Add 'implements AfterViewInit' to the class.
    /*this.equations.nativeElement.innerHTML = this.paper.abstract;
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, this.equations.nativeElement]);*/
    const element = document.getElementsByClassName('abstract');
    MathJax.Hub.Queue(['Typeset', MathJax.Hub, element]);
  }

  ngOnInit() {}
}
