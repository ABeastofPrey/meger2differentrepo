import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { FormBuilder, Validators, FormGroup, ValidatorFn, AbstractControl } from '@angular/forms';
import { ApiService, DataService, MCQueryResponse } from '../../../../core/services';
import { TPVariable } from '../../../../core/models/tp/tp-variable.model';
import { AddVarComponent } from '../../add-var/add-var.component';
import { WebsocketService } from '../../../../core/services/websocket.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-vision-load-station-book',
  templateUrl: './vision-load-station-book.component.html',
  styleUrls: ['./vision-load-station-book.component.scss']
})
export class VisionLoadStationBookComponent implements OnInit {
  form: FormGroup;
  files: VisionFile[] = [];
  selectedVariable: TPVariable;

  successfullyLoaded: boolean;

  private readonly defaultRootFolder = "SSMC";
  private readonly defaultConfigFile = "VJOB.DAT";
  private readonly defaultConfigExtension = "DAT";

  constructor(public dialogRef: MatDialogRef<VisionLoadStationBookComponent, string>,
    private formBuilder: FormBuilder,
    private api: ApiService,
    private dataService: DataService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef,
    private ws: WebsocketService
  ) { 
    this.form = this.formBuilder.group({
      configFilePath: ["", Validators.required, this.getValidator()],
      assignedTo: [""]
    });
  }

  get longVariables(): TPVariable[] {
    return this.dataService.longs.filter(x => !x.isArr);
  }

  ngOnInit() {
    console.log('get files');
    this.api.getFiles(this.defaultConfigExtension).then(result => {
      this.files = result.map(f => {
        return { fileName: f.fileName, displayPath: this.defaultRootFolder + "/" + f.fileName };
      });
    });
    const filePath = this.defaultRootFolder + "/" + this.defaultConfigFile;
    this.loadFile(filePath);
  }

  selectItem(item: VisionFile) {
    this.form.patchValue({ configFilePath: item.displayPath });
  }

  selectVariable(variable: TPVariable) {
    this.form.patchValue({ assignedTo: variable });
  }

  createVariable(): void {
    const option = {
      hasBackdrop: false,
      data: {
        varType: "LONG"
      }
    };
    this.dialog.open(AddVarComponent, option).afterClosed().subscribe(addedVar => {
      this.selectedVariable = this.longVariables.find(x => x.name === addedVar);
      this.cd.detectChanges();
    });
  }

  submitForm({ value, valid }: FormGroup): void {
    const { configFilePath, assignedTo } = value;

    if (valid) {
      const command = assignedTo ? `${assignedTo.name} = VLoadStationBook("${configFilePath}")` :
        `?VLoadStationBook("${configFilePath}")`;
      this.dialogRef.close(command);
    }
  }

  loadFile(filePath: string): void {
    this.loadAndCheck(filePath).subscribe(isTrue => {
      this.successfullyLoaded = isTrue;
      this.form.patchValue({ configFilePath: filePath });
      this.form.controls['configFilePath'].markAsTouched();
    });
  }

  private loadAndCheck(filePath: string): Observable<boolean> {
    const cmd = `?VLoadStationBook("${filePath}")`;
    const parser = (res: MCQueryResponse) => !Number(JSON.parse(res.result));
    const handler = errs => {
      console.warn(`Automatically execute command "${cmd}" failed, ${errs[0].msg}`);
      return of(false);
    };
    return this.ws.observableQuery(cmd).pipe(map(parser), catchError(handler));
  }

  private getValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      if (this.successfullyLoaded) {
        return of(null);
      } else {
        return of({
          loadFail: { }
        })
      }
    }
  }
}

interface VisionFile {
  fileName: string;
  displayPath: string;
}