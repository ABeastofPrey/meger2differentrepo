import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataService } from '../../../core';

@Component({
  selector: 'app-add-pallet-dialog',
  templateUrl: './add-pallet-dialog.component.html',
  styleUrls: ['./add-pallet-dialog.component.css'],
})
export class AddPalletDialogComponent implements OnInit {

  palletName: string = null;
  palletType: string = null;
  showWizard = true;
  public validName: boolean = false;

  constructor(
    public dataService: DataService,
    public dialogRef: MatDialogRef<AddPalletDialogComponent, NewPalletOptions>
  ) {}

  ngOnInit() {
    if (this.dataService.palletTypeOptions.length > 0) {
      this.palletType = this.dataService.palletTypeOptions[0];
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  onValidEvent(valid: boolean){
    this.validName = valid;
  }

  insert() {
    const options: NewPalletOptions = {
      name: this.palletName,
      type: this.palletType,
      showWizard: this.showWizard,
    };
    this.dialogRef.close(options);
  }
}

export interface NewPalletOptions {
  name: string;
  type: string;
  showWizard: boolean;
}
