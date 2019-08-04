import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TpLoadingComponent } from './tp-loading.component';

describe('TpLoadingComponent', () => {
  let component: TpLoadingComponent;
  let fixture: ComponentFixture<TpLoadingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TpLoadingComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TpLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
