import {
  Component,
  Injectable,
  OnInit,
  AfterViewInit,
  ViewChild,
  Input,
  OnChanges,
  SimpleChange
} from '@angular/core';
import { StatisticService } from '../statistic.service';
import {
  NzFormatEmitEvent,
  NzTreeComponent,
  NzTreeNodeOptions,
  isTemplateRef
} from 'ng-zorro-antd';

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.css']
})
export class CategoryTreeComponent implements OnInit, AfterViewInit, OnChanges {
  constructor(private statisticService: StatisticService) {}
  @Input() singleCheck: boolean;
  @ViewChild('nzTreeComponent') nzTreeComponent: NzTreeComponent;
  defaultCheckedKeys = ['2001'];
  defaultSelectedKeys = ['2001'];
  defaultExpandedKeys = ['100', '200'];

  nodes: NzTreeNodeOptions[] = [
    {
      title: 'Year 2019',
      key: '100',
      children: [
        {
          title: 'ICLR 2019',
          key: '1001',
          disabled: false,
          isLeaf: true
          /*children: [
            {
              title: 'leaf 1-0-0',
              key: '10010',
              disableCheckbox: true,
            },
          ]*/
        }
      ]
    },
    {
      title: 'Year 2018',
      key: '200',
      children: [
        {
          title: 'NeurIPS 2018',
          key: '2001',
          isLeaf: true
        },
        {
          title: 'CVPR 2018',
          key: '2002',
          isLeaf: true
        },
        {
          title: 'ICML 2018',
          key: '2003',
          isLeaf: true
        }
      ]
    }
  ];

  nzClick(event: NzFormatEmitEvent): void {
    // console.log(event);
  }

  nzCheck(event: NzFormatEmitEvent): void {
    console.log(event);
    if (this.singleCheck) {
      while (event.nodes.length > 1) {
        event.nodes[0].isChecked = false;
        event.nodes[0].setSyncChecked();
      }
    }
    const temp = [];
    event.checkedKeys.forEach(key => {
      if (key.isLeaf) {
        temp.push(key.title.replace(/ +/g, ''));
      } else {
        for (let i = 0; i < key.children.length; ++i) {
          temp.push(key.children[i].title.replace(/ +/g, ''));
        }
      }
    });
    this.statisticService.changeSelectedConferences(temp);
  }

  // nzSelectedKeys change
  nzSelect(keys: string[]): void {
    // console.log(keys, this.nzTreeComponent.getSelectedNodeList());
  }

  ngOnInit() {
    // this.conferencesService.changeSelectedConferences(['NeurIPS2018']);
  }

  ngAfterViewInit(): void {
    // get node by key: '10011'
    // console.log(this.nzTreeComponent.getTreeNodeByKey('10011'));
    // use tree methods
    // console.log(
    //   this.nzTreeComponent.getTreeNodes(),
    //   this.nzTreeComponent.getCheckedNodeList(),
    //   this.nzTreeComponent.getSelectedNodeList(),
    //   this.nzTreeComponent.getExpandedNodeList()
    // );
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // console.log(changes);
    for (const propKey in changes) {
      if (propKey === 'singleCheck') {
        console.log(changes[propKey].currentValue);
      }
    }
  }
}
