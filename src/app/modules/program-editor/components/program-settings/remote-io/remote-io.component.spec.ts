import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteIoComponent } from './remote-io.component';

describe('RemoteIoComponent', () => {
  let component: RemoteIoComponent;
  let fixture: ComponentFixture<RemoteIoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RemoteIoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemoteIoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
