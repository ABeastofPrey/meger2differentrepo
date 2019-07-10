import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JogSettingsDialogComponent } from './jog-settings-dialog.component';

describe('JogSettingsDialogComponent', () => {
  let component: JogSettingsDialogComponent;
  let fixture: ComponentFixture<JogSettingsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [JogSettingsDialogComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JogSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
