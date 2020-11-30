import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';
import { ElementRef } from '@angular/core';
import { CdkTextColumn } from '@angular/cdk/table';
import { UtilsService } from '../../modules/core/services/utils.service';

const BOXES_OFFSET = 10;
const SPEED = 5;

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css'],
})
export class PageNotFoundComponent implements OnInit {
  constructor(private _location: Location, public utils: UtilsService) {}

  env = environment;

  // EASTER
  easter = false;

  // GAME
  private isDrawCalled = false;
  private started = false;
  private score = 0;
  private boxes: Box[] = [];
  private grp: Gripper = new Gripper();
  private gameOver = false;
  @ViewChild('game') game: ElementRef;

  back() {
    this._location.back();
  }

  ngOnInit() {
    this.easter = window.location.hostname.includes('10.4.20');
  }

  draw() {
    if (this.game.nativeElement.getContext) {
      if (!this.started) {
        this.init();
        return;
      }
      const ctx = this.game.nativeElement.getContext('2d');
      ctx.save();
      ctx.clearRect(0, 0, 600, 300); // clear canvas
      ctx.font = '24px Arial';
      // WRITE SCORE
      ctx.fillText('Score:' + this.score, 20, 24);
      // WRITE INSTRUCTIONS
      ctx.font = '16px Arial';
      ctx.fillText(
        'Use UP/DOWN arrows to pick all boxes on the conveyor.',
        20,
        40
      );
      // ADD CONVEYOR
      ctx.fillStyle = '#e2e2e2';
      ctx.fillRect(0, 280, 600, 20);
      // ADD ROBOT
      const img = new Image();
      img.src = "assets/pics/robot_g.svg";
      ctx.translate(20, -20);
      // UPDATE J4
      ctx.fillRect(
        this.grp.xPos,
        this.grp.yPos,
        this.grp.width,
        this.grp.height
      );
      ctx.drawImage(img, 0, 0, 300, 300);
      // DRAW BOXES AND CHECK FOR COLLISION
      ctx.translate(0, BOXES_OFFSET);
      ctx.fillStyle = '#ffaa56';
      const filteredBoxes = this.boxes.filter(box => {
        return !box.remove;
      });
      for (let i = 0; i < filteredBoxes.length; i++) {
        const b = filteredBoxes[i];
        if (b.xPos === 121) {
          b.remove = true;
        }
        b.xPos--;
        ctx.fillStyle = b.success ? 'lime' : '#ffaa56';
        ctx.fillRect(b.xPos, b.yPos, b.width, b.height);
        // Check for collision
        if (b.cleared) continue;
        if (b.xPos + b.width < this.grp.xPos) {
          b.cleared = true;
          continue;
        }
        b.touchable = b.xPos < this.grp.xPos + this.grp.width;
        const grpBottomY = this.grp.yPos + this.grp.height;
        const checkX = b.xPos <= this.grp.xPos + this.grp.width;
        const checkY = b.yPos + BOXES_OFFSET < grpBottomY;
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
      if (this.gameOver) return;
      // ADD NEW BOXES
      const lastBox = this.boxes[this.boxes.length - 1];
      const distance = (Math.random() * 100 + 1) * 20;
      if (lastBox.xPos < 600 - lastBox.width - distance) {
        this.boxes.push(new Box());
      }
      ctx.restore();
      window.requestAnimationFrame(() => {
        this.draw();
      });
    } else {
      alert('NO CONTEXT FOUND');
    }
  }

  init() {
    this.boxes.push(new Box());
    this.started = true;
    this.draw();
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      this.grp.yPos += this.grp.yPos >= 180 ? 0 : SPEED;
    } else if (e.key === 'ArrowUp') {
      this.grp.yPos -= this.grp.yPos <= 115 ? 0 : SPEED;
    } else if (e.key === 'Enter' && (this.utils.IsNotKuka || this.easter)) {
      const el = document.getElementById('credits') as HTMLVideoElement;
      el.play();
    }
  }

  onCanvasClick() {
    if (!this.isDrawCalled) {
      window.requestAnimationFrame(() => {
        this.draw();
      });
      this.isDrawCalled = true;
    }
  }
}

class Box {
  width = (Math.random() * 3 + 1) * 20;
  height = (Math.random() * 3 + 1) * 20;
  xPos = 600;
  yPos = 300 - this.height;
  cleared = false;
  touchable = false;
  success = false;
  remove = false;
}
class Gripper {
  yPos = 140;
  xPos = 255;
  height = 100;
  width = 5;
}
