import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {DataService} from '../../../../core';

@Component({
  selector: 'domain-selector',
  templateUrl: './domain-selector.component.html',
  styleUrls: ['./domain-selector.component.css']
})
export class DomainSelectorComponent implements OnInit {
  
  @Input() disabled : boolean;
  @Input() prompt : string;
  @Output() change = new EventEmitter;

  constructor(
    public dataService: DataService
  ) { }
  
  ngOnInit() {
  }
  
  onChange() {
    this.change.emit();
  }

}
