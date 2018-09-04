import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileMngrComponent } from './file-mngr.component';

describe('FileMngrComponent', () => {
  let component: FileMngrComponent;
  let fixture: ComponentFixture<FileMngrComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileMngrComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileMngrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
