import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorHistoryComponent } from './error-history.component';

describe('ErrorHistoryComponent', () => {
  let component: ErrorHistoryComponent;
  let fixture: ComponentFixture<ErrorHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ErrorHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ErrorHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
