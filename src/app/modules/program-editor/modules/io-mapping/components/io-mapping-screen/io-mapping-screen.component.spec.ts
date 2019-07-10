import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IoMappingScreenComponent } from './io-mapping-screen.component';

describe('IoMappingScreenComponent', () => {
  let component: IoMappingScreenComponent;
  let fixture: ComponentFixture<IoMappingScreenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IoMappingScreenComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IoMappingScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
