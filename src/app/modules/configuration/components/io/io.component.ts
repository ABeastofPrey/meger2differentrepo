import { Component, OnInit } from '@angular/core';
import {Sort} from '@angular/material';

@Component({
  selector: 'app-io',
  templateUrl: './io.component.html',
  styleUrls: ['./io.component.css']
})
export class IoComponent implements OnInit {
  
  /* 
   * THIS DATA SHOULD EVENTUALLY COME FROM A SERVICE, BUT FOR THIS EXAMPLE
   * IT IS HARD-CODED...
   */
  private inputs : IO[] = [
    {index:0,status:false,label:'Omri'},
    {index:1,status:false,label:'Mirko'},
    {index:2,status:true,label:'Wallace'}
  ];
  
  sortedData: IO[]; // THIS IS THE SORTED ARRAY THAT WILL BE DISPLAYED IN TABLE

  constructor() { 
    this.sortedData = this.inputs.slice();
  }

  ngOnInit() {
  }
  
  private compare(a, b, isAsc) {
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }
  
  sortData(sort: Sort) {
    const data = this.inputs.slice();
    if (!sort.active || sort.direction === '') {
      this.sortedData = data;
      return;
    }

    this.sortedData = data.sort((a, b) => {
      const isAsc = sort.direction === 'asc';
      switch (sort.active) {
        case 'index': return this.compare(a.index, b.index, isAsc);
        case 'status': return this.compare(a.status, b.status, isAsc);
        case 'label': return this.compare(a.label, b.label, isAsc);
        default: return 0;
      }
    });
    
  }

}

/*
 * NOTICE: THIS INTERFACE SHOULD BE ON A SEPARATE FILE IN THE MODELS FOLDER IN THE CORE
 * MODULE, BUT AGAIN, FOR THIS EXAMPLE IT'S HERE...
 */

interface IO {
  index: number;
  status: boolean;
  label: string;
}