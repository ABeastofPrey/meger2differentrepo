import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoSelectorDialogComponent } from './io-selector-dialog.component';

describe('IoSelectorDialogComponent', () => {
  let component: IoSelectorDialogComponent;
  let fixture: ComponentFixture<IoSelectorDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IoSelectorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoSelectorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
