import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { OrganizationRank } from '../organization-rank';

@Component({
  selector: 'app-rank-dialog',
  templateUrl: './rank-dialog.component.html',
  styleUrls: ['./rank-dialog.component.css']
})
export class RankDialogComponent implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: OrganizationRank) {}

  ngOnInit() {}
}
