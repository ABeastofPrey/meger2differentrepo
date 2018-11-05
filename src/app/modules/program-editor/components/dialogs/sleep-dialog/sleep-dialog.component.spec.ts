import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SleepDialogComponent } from './sleep-dialog.component';

describe('SleepDialogComponent', () => {
  let component: SleepDialogComponent;
  let fixture: ComponentFixture<SleepDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SleepDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SleepDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
