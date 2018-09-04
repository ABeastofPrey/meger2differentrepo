import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalGraphDialogComponent } from './external-graph-dialog.component';

describe('ExternalGraphDialogComponent', () => {
  let component: ExternalGraphDialogComponent;
  let fixture: ComponentFixture<ExternalGraphDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExternalGraphDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalGraphDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
