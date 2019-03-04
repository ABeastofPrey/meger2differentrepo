import { Injectable } from '@angular/core';
import {TreeNode} from './components/mc-file-tree/mc-file-tree.component';
import {ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileFilterService {
  
  private worker = new Worker('assets/scripts/fileFilter.worker.js');
  
  filteredData: ReplaySubject<TreeNode[]> = new ReplaySubject<TreeNode[]>(1);

  constructor() {
    this.worker.onmessage = (e)=>{
      this.filteredData.next(e.data);
    };
  }
  
  filter(nodes: TreeNode[], search: string) {
    this.worker.postMessage({
      nodes: nodes,
      search: search
    });
  }
}
