import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomItemMenuComponent } from './custom-item-menu.component';

describe('CustomItemMenuComponent', () => {
  let component: CustomItemMenuComponent;
  let fixture: ComponentFixture<CustomItemMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomItemMenuComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomItemMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
