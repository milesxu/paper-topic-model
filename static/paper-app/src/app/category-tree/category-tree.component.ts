import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, OnInit, Input, Injectable } from '@angular/core';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { ConferenceService } from '../conference.service';
import { StateService } from '../state.service';
import { BehaviorSubject } from 'rxjs';

export class CategoryTreeItemNode {
  children: CategoryTreeItemNode[];
  item: string;
}

export class CategoryTreeItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

const CONF_DATA = {
  2019: {
    CVPR2019: null,
    ICLR2019: null,
    ICML2019: null
  },
  2018: {
    CVPR2018: null,
    ICML2018: null,
    NeurIPS2018: null
  }
};

@Injectable()
export class CategoryTreeDatabase {
  dataChange = new BehaviorSubject<CategoryTreeItemNode[]>([]);

  get data(): CategoryTreeItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    const data = this.buildTree(CONF_DATA, 0);
    this.dataChange.next(data);
  }

  buildTree(
    obj: { [key: string]: any },
    level: number
  ): CategoryTreeItemNode[] {
    return Object.keys(obj).reduce<CategoryTreeItemNode[]>((acc, key) => {
      const value = obj[key];
      const node = new CategoryTreeItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return acc.concat(node);
    }, []);
  }
}

@Component({
  selector: 'app-category-tree',
  templateUrl: './category-tree.component.html',
  styleUrls: ['./category-tree.component.css'],
  providers: [CategoryTreeDatabase]
})
export class CategoryTreeComponent implements OnInit {
  flatNodeMap = new Map<CategoryTreeItemFlatNode, CategoryTreeItemNode>();
  nestedNodeMap = new Map<CategoryTreeItemNode, CategoryTreeItemFlatNode>();
  selectedParent: CategoryTreeItemFlatNode | null = null;
  treeControl: FlatTreeControl<CategoryTreeItemFlatNode>;
  treeFlattener: MatTreeFlattener<
    CategoryTreeItemNode,
    CategoryTreeItemFlatNode
  >;
  dataSource: MatTreeFlatDataSource<
    CategoryTreeItemNode,
    CategoryTreeItemFlatNode
  >;
  checklistSelection = new SelectionModel<CategoryTreeItemFlatNode>(true);
  constructor(
    private conferenceService: ConferenceService,
    private stateService: StateService,
    private database: CategoryTreeDatabase
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<CategoryTreeItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    database.dataChange.subscribe(data => {
      this.dataSource.data = data;
    });
  }

  @Input() singleCheck: boolean;
  ngOnInit() {
    // this.stateService.singleCheck$.subscribe(chk => (this.singleCheck = chk));
  }

  transformer = (node: CategoryTreeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new CategoryTreeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  getLevel = (node: CategoryTreeItemFlatNode) => node.level;

  isExpandable = (node: CategoryTreeItemFlatNode) => node.expandable;

  getChildren = (node: CategoryTreeItemNode): CategoryTreeItemNode[] =>
    node.children

  hasChild = (_: number, _nodeData: CategoryTreeItemFlatNode) =>
    _nodeData.expandable

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: CategoryTreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: CategoryTreeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  CategoryItemSelectionToggle(node: CategoryTreeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: CategoryTreeItemFlatNode): void {
    let parent: CategoryTreeItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: CategoryTreeItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(
    node: CategoryTreeItemFlatNode
  ): CategoryTreeItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }
}
