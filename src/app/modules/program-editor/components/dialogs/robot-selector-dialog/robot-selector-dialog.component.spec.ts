import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {RobotSelectorDialogComponent} from './robot-selector-dialog.component';

describe('RobotSelectorDialogComponent', () => {
  let component: RobotSelectorDialogComponent;
  let fixture: ComponentFixture<RobotSelectorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RobotSelectorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RobotSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
