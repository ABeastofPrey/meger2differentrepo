import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataScreenComponent } from './data-screen.component';

describe('DataScreenComponent', () => {
  let component: DataScreenComponent;
  let fixture: ComponentFixture<DataScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DataScreenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
