import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewPayloadDialogComponent } from './new-payload-dialog.component';

describe('NewPayloadDialogComponent', () => {
  let component: NewPayloadDialogComponent;
  let fixture: ComponentFixture<NewPayloadDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewPayloadDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewPayloadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
