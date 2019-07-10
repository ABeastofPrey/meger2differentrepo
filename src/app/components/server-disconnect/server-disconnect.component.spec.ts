import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerDisconnectComponent } from './server-disconnect.component';

describe('ServerDisconnectComponent', () => {
  let component: ServerDisconnectComponent;
  let fixture: ComponentFixture<ServerDisconnectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServerDisconnectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerDisconnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
