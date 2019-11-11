import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecordingsScreenComponent } from './recordings-screen.component';

describe('RecordingsScreenComponent', () => {
  let component: RecordingsScreenComponent;
  let fixture: ComponentFixture<RecordingsScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecordingsScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecordingsScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
