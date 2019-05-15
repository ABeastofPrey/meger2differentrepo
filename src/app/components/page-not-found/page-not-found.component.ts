import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import {environment} from '../../../environments/environment';
import {ElementRef} from '@angular/core';

const BOXES_OFFSET : number = 10;
const SPEED : number = 3;

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private _location: Location) { }
  
  public env = environment;
  
  // GAME
  private isDrawCalled: boolean = false;
  private started: boolean = false;
  private score: number = 0;
  private boxes: Box[] = [];
  private grp: Gripper = new Gripper();
  private gameOver: boolean = false;
  @ViewChild('game') game: ElementRef;
  
  back() { this._location.back(); }

  ngOnInit() {
    
  }
  
  draw() {
    if (this.game.nativeElement.getContext) {
      if (!this.started) {
        this.init();
        return;
      }
      let ctx = this.game.nativeElement.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, 600, 300); // clear canvas
      ctx.font = '24px serif';
      // WRITE SCORE
      ctx.fillText('Score:' + this.score, 20, 36);
      // WRITE INSTRUCTIONS
      ctx.font = '16px serif';
      ctx.fillText('Use UP/DOWN arrows to pick all boxes on the conveyor.', 20, 56);
      // ADD CONVEYOR
      ctx.fillStyle = 'rgb(10, 78, 78)';
      ctx.fillRect(0, 280, 600, 20);
      // ADD ROBOT
      ctx.translate(20, -20);
      ctx.fillStyle = 'rgb(40, 148, 148)';
      ctx.fillRect(0, 260, 60, 40); // J1
      ctx.fillRect(40, 220, 80, 40); // J2
      // ADD J3
      ctx.beginPath();
      ctx.moveTo(80, 220);
      ctx.lineTo(220, 220);
      ctx.lineTo(220, 200);
      ctx.lineTo(200, 180);
      ctx.lineTo(80, 180);
      ctx.fill();
      // UPDATE J4
      ctx.fillRect(
        this.grp.xPos,
        this.grp.yPos,
        this.grp.width,
        this.grp.height
      );
      // DRAW BOXES AND CHECK FOR COLLISION
      ctx.translate(0, BOXES_OFFSET);
      ctx.fillStyle = '#C0C0C0';
      let filteredBoxes = this.boxes.filter(function(box){
        return !box.remove;
      });
      for (let i=0; i<filteredBoxes.length; i++) {
        let b = filteredBoxes[i];
        if (b.xPos === 121) {
          b.remove = true;
        }
        b.xPos--;
        ctx.fillStyle = b.success ? 'lime' : '#C0C0C0';
        ctx.fillRect(b.xPos, b.yPos, b.width, b.height);
        // Check for collision
        if (b.cleared)
          continue;
        if (b.xPos + b.width < this.grp.xPos) {
          b.cleared = true;
          continue;
        }
        b.touchable = b.xPos < this.grp.xPos + this.grp.width;
        let grpBottomY = this.grp.yPos + this.grp.height;
        let checkX = b.xPos <= this.grp.xPos + this.grp.width;
        let checkY = b.yPos + BOXES_OFFSET < grpBottomY;
        if (checkX && checkY) {
          if (b.touchable) {
            b.success = true;
            b.cleared = true;
            this.score++;
          } else {
            alert('BOOM!!! Your score is: ' + this.score);
            this.gameOver = true;
          }
        }
      }
      ctx.fillStyle = '#C0C0C0';
      if (this.gameOver)
        return;
      // ADD NEW BOXES
      let lastBox = this.boxes[this.boxes.length-1];
      let distance = ((Math.random() * 100) + 1) * 20;
      if (lastBox.xPos < (600 - lastBox.width - distance)) {
        this.boxes.push(new Box());
      }
      ctx.restore();
      window.requestAnimationFrame(()=>{
        this.draw();
      });
    } else {
      alert('NO CONTEXT FOUND');
    }
  }
  
  init() {
    this.boxes.push(new Box());
    window.addEventListener("keydown", e=>{
      this.onKeyDown(e);
    }, false);
    this.started = true;
    this.draw();
  }
  
  onKeyDown(e: KeyboardEvent) {
    if (e.keyCode === 40) // keydown
      this.grp.yPos += this.grp.yPos >= 180 ? 0 : SPEED;
    else if (e.keyCode === 38) // keyup
      this.grp.yPos -= this.grp.yPos <= 115 ? 0 : SPEED;
  }
  
  onCanvasClick() {
    if (!this.isDrawCalled) {
      window.requestAnimationFrame(()=>{
        this.draw();
      });
      this.isDrawCalled = true;
    }
  }

}

class Box {
  width = ((Math.random() * 3) + 1) * 20;
  height = ((Math.random() * 3) + 1) * 20;
  xPos = 600;
  yPos = 300 - this.height;
  cleared = false;
  touchable = false;
  success = false;
  remove = false;
};
class Gripper  {
  yPos = 140;
  xPos = 180;
  height = 100;
  width = 10;
};
