import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/internal/Observable';
import { from } from 'rxjs/internal/observable/from';
import { TraceService, Trace } from '../../../../dashboard/services/trace.service';

@Component({
  selector: 'app-trace-selector',
  templateUrl: './trace-selector.component.html',
  styleUrls: ['./trace-selector.component.css']
})
export class TraceSelectorComponent implements OnInit {
  public traceList: Observable<Trace[]>;
  public selectedTrace: string = null;
  public traceNum: number = 0;

  constructor(
    public dialogRef: MatDialogRef<TraceSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    public service: TraceService
  ) {}

  insert() {
    this.dialogRef.close(this.selectedTrace);  

  }

  ngOnInit() {
    this.traceList = this.service.getTraceList();
    from(this.traceList).subscribe(res => {
        this.traceNum = res.length;    
    })
  }

}
