import { Component, OnInit } from '@angular/core';
import {RobotService} from '../../../core/services/robot.service';
import {MatDialog, MatSnackBar} from '@angular/material';
import {RobotSelectionComponent} from '../robot-selection/robot-selection.component';
import {UpdateDialogComponent} from '../../../../components/update-dialog/update-dialog.component';
import {WebsocketService, MCQueryResponse, ApiService, DataService} from '../../../core';
import {RobotModel} from '../../../core/models/robot.model';
import {trigger, transition, style, animate} from '@angular/animations';

@Component({
  selector: 'app-robots',
  templateUrl: './robots.component.html',
  styleUrls: ['./robots.component.css'],
  animations: [
    trigger('fade',[
      transition(':enter', [
        style({ opacity: 0 }),
        animate('1s', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        style({ opacity: 1 }),
        animate('1s', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class RobotsComponent implements OnInit {
  
  disp : number[];
  dh: DH[];
  dh_img_path_1: string;
  dh_img_path_2: string;

  constructor(
    public robot: RobotService,
    private dialog: MatDialog,
    private ws: WebsocketService,
    private api: ApiService,
    private data: DataService,
    private snack: MatSnackBar
  ) { }

  ngOnInit() {
    this.data.dataLoaded.subscribe(stat=>{
      if (stat) {
        switch(this.data.robotType) {
          case 'PUMA':
            this.dh_img_path_1 = 'DH_puma1.jpg';
            this.dh_img_path_2 = 'DH_puma2.jpg';
            break;
          case 'SCARA':
            this.dh_img_path_1 = 'DH_scara1.jpg';
            break;
        }
        this.refreshDisp();
        this.refreshDH();
        this.data.selectedFrame = 'JOINT';
        this.ws.query('?tp_speed(10)');
      }
    });
  }
  
  private refreshDisp() {
    let cmd = '?TP_GET_ROBOT_DISPLACEMENTS(' + this.data.selectedRobot + ')';
    this.ws.query(cmd).then((ret:MCQueryResponse)=>{
      let values = ret.result.split(',');
      let nValues : number[] = [];
      let n;
      for (let val of values) {
        n = Number(val);
        if (!isNaN(n))
          nValues.push(Math.round(n*100)/100); // ROUND TO NEAREST 2 DECIMALS
      }
      if (values.length === nValues.length)
        this.disp = nValues;
    });
  }
  
  private refreshDH() {
    this.dh = [];
    let dh : DH[] = [];
    if (this.data.robotType === 'PUMA') {
      dh.push({name: 'a1', value: 0});
      dh.push({name: 'a2', value: 0});
      dh.push({name: 'd2', value: 0});
      dh.push({name: 'a3', value: 0});
      dh.push({name: 'd4', value: 0});
      dh.push({name: 'd6', value: 0});
    } else if (this.data.robotType === 'SCARA') {
      dh.push({name: 'L1', value: 0});
      dh.push({name: 'L2', value: 0});
    }
    let promises : Promise<any>[] = [];
    const cmd = '?TP_GET_ROBOT_DH(' + this.data.selectedRobot+',';
    for (let d of dh) {
      promises.push(this.ws.query(cmd + '"' + d.name + '")'));
    }
    Promise.all(promises).then((ret:MCQueryResponse[])=>{
      for (let i = 0; i < ret.length; i++) {
        if (dh[i])
          dh[i].value = Number(ret[i].result);
      }
      this.dh = dh;
    });
  }
  
  trackByFn(index: any, item: any) {
    return index;
  }
  
  setHome(axis:number) {
    let cmd = '?TP_SET_HOME_POSITION('+this.data.selectedRobot+','+axis+')';
    this.ws.query(cmd).then(()=>{
      this.refreshDisp();
    });
  }
  
  onSettingsKeyboardClose(index?:number) {
    let values = this.disp.join(',');
    let cmd = '?TP_SET_ROBOT_DISPLACEMENTS(' + this.data.selectedRobot + ',"'+
              values + '")';
    this.ws.query(cmd).then(()=>{
      if (index === undefined) {
        this.snack.open('changes_saved','',{duration:1500});
      } else {
        this.ws.query('?tp_set_robot_dh(' + this.data.selectedRobot +
          ',"A' + (index + 1) + '",' + this.dh[index].value + ')')
        .then((ret: MCQueryResponse)=>{
          if (ret.result === '0') {
            this.snack.open('DH Parameters save','DISMISS');
          }
        });
      }
    });
  }
  
  openRobotSelectionDialog() {
    this.dialog.open(RobotSelectionComponent).afterClosed().subscribe((ret:RobotModel)=>{
      if (ret) {
        let dialog = this.dialog.open(UpdateDialogComponent,{
          disableClose: true,
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          closeOnNavigation: false,
          data: 'Updating Robot Configuration',
          id: 'update'
        });
        this.ws.query('?ROB_SELECT_ROBOT_CONFIGURATION("' + ret['part number'] + '",0)').then((ret:MCQueryResponse)=>{
          if (ret.result === '0') {
            this.ws.updateFirmwareMode = true;
            this.ws.query('?user sys_reboot(0,0,0)');
            setTimeout(()=>{
              let ok = false;
              let interval = setInterval(()=>{
                if (ok)
                  return;
                this.api.getFile("isWebServerAlive.HTML").then(ret=>{
                  ok = true;
                  clearInterval(interval);
                  location.href = location.href + '?from=robot';
                }).catch(err=>{
                  
                });
              },2000);
            },10000);
          } else {
            dialog.close();
          }
        });
      }
    });
  }

}

interface DH {
  name: string;
  value: number;
}