import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { McFileTreeComponent } from './mc-file-tree.component';

describe('McFileTreeComponent', () => {
  let component: McFileTreeComponent;
  let fixture: ComponentFixture<McFileTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [McFileTreeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(McFileTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
