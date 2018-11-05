import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DimDialogComponent } from './dim-dialog.component';

describe('DimDialogComponent', () => {
  let component: DimDialogComponent;
  let fixture: ComponentFixture<DimDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DimDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DimDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
