import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { stratify, tree, HierarchyPointNode, HierarchyPointLink } from 'd3-hierarchy';
import { SearchNode } from '../../models/tile';

@Component({
  selector: 'app-search-tree',
  imports: [CommonModule],
  templateUrl: './search-tree.html',
  styleUrl: './search-tree.css',
})
export class SearchTree implements OnChanges {
  @Input() nodes: SearchNode[] = [];
  @Input() goal: number[] = [];

  readonly W = 60;                       // size of each mini board
  laid: HierarchyPointNode<SearchNode>[] = [];
  links: HierarchyPointLink<SearchNode>[] = [];
  viewBox = '0 0 100 100';
  width = 0;
  height = 0;

  ngOnChanges() {
    if (!this.nodes.length) {
      this.laid = [];
      this.links = [];
      return;
    }

    // turn the flat list (id + parent) into a hierarchy
    const root = stratify<SearchNode>()
      .id(d => String(d.id))
      .parentId(d => (d.parent === null ? null : String(d.parent)))(this.nodes);

    // compute x/y for every node
    const t = tree<SearchNode>().nodeSize([this.W + 24, this.W + 70])(root);
    this.laid = t.descendants();
    this.links = t.links();

    // size the SVG to fit
    const xs = this.laid.map(n => n.x);
    const pad = 20;
    const minX = Math.min(...xs) - this.W / 2 - pad;
    this.width = Math.max(...xs) - Math.min(...xs) + this.W + pad * 2;
    this.height = Math.max(...this.laid.map(n => n.y)) + this.W + pad * 2;
    this.viewBox = `${minX} ${-pad} ${this.width} ${this.height}`;
  }

  midX(l: HierarchyPointLink<SearchNode>) {
    return (l.source.x + l.target.x) / 2;
  }

  midY(l: HierarchyPointLink<SearchNode>) {
    return (l.source.y + this.W + l.target.y) / 2;
  }

  zoom = 1;

  zoomIn()  { this.zoom = Math.min(this.zoom + 0.2, 3); }
  zoomOut() { this.zoom = Math.max(this.zoom - 0.2, 0.2); }
  resetZoom() { this.zoom = 1; }

  // the 9 cells of one board; `correct` = tile already in its goal position (red)
  cells(state: number[]) {
    const c = this.W / 3;
    return state.map((v, i) => ({
      v,
      x: (i % 3) * c,
      y: Math.floor(i / 3) * c,
      c,
      correct: v !== 0 && v === this.goal[i],
    }));
  }
}