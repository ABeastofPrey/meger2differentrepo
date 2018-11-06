import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubDialogComponent } from './sub-dialog.component';

describe('SubDialogComponent', () => {
  let component: SubDialogComponent;
  let fixture: ComponentFixture<SubDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
