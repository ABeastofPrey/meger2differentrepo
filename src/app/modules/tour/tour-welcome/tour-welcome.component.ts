import { BehaviorSubject } from 'rxjs';
import { MCProject } from './../../core/models/project/mc-project.model';
import { TourService } from 'ngx-tour-md-menu';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-tour-welcome',
  templateUrl: './tour-welcome.component.html',
  styleUrls: ['./tour-welcome.component.css']
})
export class TourWelcomeComponent implements OnInit {

  disableReason: string = null;

  constructor(
    private tour: TourService,
    private ref: MatDialogRef<void>,
    private overlayContainer: OverlayContainer,
    @Inject(MAT_DIALOG_DATA) private data: MCProject
  ) { }

  ngOnInit() {
    this.disableReason = null;
    this.tour.disableHotkeys();
    const prj = this.data;
    if (!prj) return this.disableReason = '1';
    if (prj.name !== 'DEMO') return this.disableReason = '2';
    if (!prj.apps.find(a=>a.name === 'CIRCLE')) return this.disableReason = '3';
    this.tour.start$.subscribe(()=>{
      this.overlayContainer.getContainerElement().classList.add('tour');
    });
    this.tour.end$.subscribe(()=>{
      this.overlayContainer.getContainerElement().classList.remove('tour');
    });
  }

  startTour() {
    this.ref.close();
    this.tour.start();
  }
  

}
