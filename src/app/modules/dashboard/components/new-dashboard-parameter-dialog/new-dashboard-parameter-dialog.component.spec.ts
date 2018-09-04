import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDashboardParameterDialogComponent } from './new-dashboard-parameter-dialog.component';

describe('NewDashboardParameterDialogComponent', () => {
  let component: NewDashboardParameterDialogComponent;
  let fixture: ComponentFixture<NewDashboardParameterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewDashboardParameterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewDashboardParameterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
