import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramToolbarComponent } from './program-toolbar.component';

describe('ProgramToolbarComponent', () => {
  let component: ProgramToolbarComponent;
  let fixture: ComponentFixture<ProgramToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProgramToolbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
