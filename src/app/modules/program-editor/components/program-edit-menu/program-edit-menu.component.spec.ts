import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramEditMenuComponent } from './program-edit-menu.component';

describe('ProgramEditMenuComponent', () => {
  let component: ProgramEditMenuComponent;
  let fixture: ComponentFixture<ProgramEditMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProgramEditMenuComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramEditMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
