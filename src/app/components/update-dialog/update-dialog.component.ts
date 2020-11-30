import { CommonService } from './../../modules/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { Component, OnInit } from '@angular/core';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-update-dialog',
  templateUrl: './update-dialog-component.html',
  styleUrls: ['./update-dialog.component.css'],
})
export class UpdateDialogComponent implements OnInit {
  
  selectedIndex = 0;
  trivia: Array<{i:number, str: string}> = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public title: string,
    private trn: TranslateService,
    public cmn: CommonService,
    private dialogRef: MatDialogRef<UpdateDialogComponent>
  ) {}

  get background() {
    if (this.trivia.length === 0) return '#fff';
    const selected = this.trivia[this.selectedIndex];
    return "url('" + this.getSource(selected.i) + "')";
  }

  getSource(i: number) {
    return `assets/pics/trivia/${this.cmn.theme}/${i}.gif`;
  }

  ngOnInit() {
    this.trn.get('trivia').toPromise().then((ret:string[])=>{
      this.trivia = ret.map((str,i)=>{
        return {i, str};
      });
      this.preload();
      this.shuffle(this.trivia);
      setInterval(()=>{
        if (this.selectedIndex < this.trivia.length - 1) {
          this.selectedIndex++;
        }
        else {
          this.selectedIndex = 0;
        }
      },10000);
    });
    const sub = this.dialogRef.afterClosed().subscribe(() => {
      sub.unsubscribe();
    });
  }

  shuffle(array: Array<{}>) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  preload() {
    for (let i=0; i<this.trivia.length; i++) {
      const img = new Image();
      img.src = this.getSource(i);
    }
  }


}
