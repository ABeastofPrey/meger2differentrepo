import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchWindowComponent } from './watch-window.component';

describe('WatchWindowComponent', () => {
  let component: WatchWindowComponent;
  let fixture: ComponentFixture<WatchWindowComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WatchWindowComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WatchWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
