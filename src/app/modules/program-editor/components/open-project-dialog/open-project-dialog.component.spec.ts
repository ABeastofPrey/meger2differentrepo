import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenProjectDialogComponent } from './open-project-dialog.component';

describe('OpenProjectDialogComponent', () => {
  let component: OpenProjectDialogComponent;
  let fixture: ComponentFixture<OpenProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OpenProjectDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
