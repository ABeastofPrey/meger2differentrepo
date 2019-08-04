import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReleaseNoteComponent } from './release-note.component';
import { HttpClient } from '@angular/common/http';

const fakeHttp = {
  get: () => {
    return {
      subscribe: cb => {
        cb('release note');
      },
    };
  },
};

describe('ReleaseNoteComponent', () => {
  let component: ReleaseNoteComponent;
  let fixture: ComponentFixture<ReleaseNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ReleaseNoteComponent],
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      providers: [{ provide: HttpClient, useValue: fakeHttp }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should retrive release note file', async(() => {
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(component.releaseNote).toBe('release note');
    });
  }));
});
