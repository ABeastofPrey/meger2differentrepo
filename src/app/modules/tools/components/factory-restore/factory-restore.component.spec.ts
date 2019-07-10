import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactoryRestoreComponent } from './factory-restore.component';

describe('FactoryRestoreComponent', () => {
  let component: FactoryRestoreComponent;
  let fixture: ComponentFixture<FactoryRestoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FactoryRestoreComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactoryRestoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
