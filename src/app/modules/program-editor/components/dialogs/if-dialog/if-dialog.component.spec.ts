import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IfDialogComponent } from './if-dialog.component';

describe('IfDialogComponent', () => {
  let component: IfDialogComponent;
  let fixture: ComponentFixture<IfDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IfDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
