import { Component, OnInit, Input } from '@angular/core';
import { Paper } from '../paper';

@Component({
  selector: 'app-paper-detail',
  templateUrl: './paper-detail.component.html',
  styleUrls: ['./paper-detail.component.css']
})
export class PaperDetailComponent implements OnInit {
  @Input() paper: Paper;
  constructor() {}

  ngOnInit() {}
}
