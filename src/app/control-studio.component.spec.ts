import { TestBed, async } from '@angular/core/testing';
import { ControlStudioComponent } from './control-studio.component';
describe('ControlStudioComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ControlStudioComponent],
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(ControlStudioComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
