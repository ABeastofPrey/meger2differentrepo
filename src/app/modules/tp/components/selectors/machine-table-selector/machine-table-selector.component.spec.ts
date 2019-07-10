import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MachineTableSelectorComponent } from './machine-table-selector.component';

describe('MachineTableSelectorComponent', () => {
  let component: MachineTableSelectorComponent;
  let fixture: ComponentFixture<MachineTableSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MachineTableSelectorComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MachineTableSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
