import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Pipe,
  PipeTransform
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Paper, PaperService } from '../paper.service';
declare var MathJax: any;

@Pipe({
  name: 'highlight'
})
export class HighlightSearch implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any, args: any): any {
    if (!args) {
      return value;
    }
    // Match in a case insensitive maneer
    const re = new RegExp(args, 'gi');
    const match = value.match(re);

    // If there's no match, just return the original value.
    if (!match) {
      return value;
    }

    const replacedValue = value.replace(re, '<mark>' + match[0] + '</mark>');
    return this.sanitizer.bypassSecurityTrustHtml(replacedValue);
  }
}

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.component.html',
  styleUrls: ['./paper-detail.component.css']
})
export class PaperDetailComponent implements OnInit, AfterViewInit {
  @Input() paper: Paper;
  @Input() topic: string;
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
