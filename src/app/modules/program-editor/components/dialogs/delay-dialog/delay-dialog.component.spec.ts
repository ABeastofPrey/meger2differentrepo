import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DelayDialogComponent } from './delay-dialog.component';

describe('DelayDialogComponent', () => {
  let component: DelayDialogComponent;
  let fixture: ComponentFixture<DelayDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DelayDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DelayDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
