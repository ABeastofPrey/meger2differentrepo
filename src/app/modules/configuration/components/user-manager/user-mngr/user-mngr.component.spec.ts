import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserMngrComponent } from './user-mngr.component';

describe('UserMngrComponent', () => {
  let component: UserMngrComponent;
  let fixture: ComponentFixture<UserMngrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserMngrComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserMngrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
