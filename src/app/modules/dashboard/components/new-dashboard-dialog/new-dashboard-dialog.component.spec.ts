import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDashboardDialogComponent } from './new-dashboard-dialog.component';

describe('NewDashboardDialogComponent', () => {
  let component: NewDashboardDialogComponent;
  let fixture: ComponentFixture<NewDashboardDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NewDashboardDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDashboardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
