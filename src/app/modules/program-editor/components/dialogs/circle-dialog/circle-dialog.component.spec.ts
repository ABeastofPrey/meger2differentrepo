import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CircleDialogComponent } from './circle-dialog.component';

describe('CircleDialogComponent', () => {
  let component: CircleDialogComponent;
  let fixture: ComponentFixture<CircleDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CircleDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CircleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
