import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JogScreenComponent } from './jogscreen.component';

describe('JogScreenComponent', () => {
  let component: JogScreenComponent;
  let fixture: ComponentFixture<JogScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JogScreenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JogScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
