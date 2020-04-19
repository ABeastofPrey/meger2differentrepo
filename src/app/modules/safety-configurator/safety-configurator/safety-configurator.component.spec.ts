import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SafetyConfiguratorComponent } from './safety-configurator.component';

describe('SafetyConfiguratorComponent', () => {
  let component: SafetyConfiguratorComponent;
  let fixture: ComponentFixture<SafetyConfiguratorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SafetyConfiguratorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SafetyConfiguratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
