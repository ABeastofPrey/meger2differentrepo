import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TraceNewComponent } from './trace-new.component';
import { SharedModule } from '../../../../shared/shared.module';
import { UnitTestModule } from '../../../../shared/unit-test.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('TraceNewComponent', () => {
  let component: TraceNewComponent;
  let fixture: ComponentFixture<TraceNewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TraceNewComponent],
      imports: [SharedModule, BrowserAnimationsModule, UnitTestModule,],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TraceNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should input valid value', () => {
//     expect(component.control.value).toBe('');
//     component.traceList = [{ name: 'Trace' }] as any;
//     const hostElement = fixture.nativeElement;
//     const inputElement: HTMLInputElement = hostElement.querySelector('input');
//     inputElement.value = 'Trace';
//     inputElement.dispatchEvent(new Event('input'));
//     expect(component.control.value).toBe('Trace');
//   });

//   it('should emit valid value when press enter key', () => {
//     const hostElement = fixture.nativeElement;
//     const inputElement: HTMLInputElement = hostElement.querySelector('input');
//     inputElement.value = 'Trace';
//     component.createTraceEvent.subscribe(res => {
//       expect(res).toEqual('Trace');
//     });
//     inputElement.dispatchEvent(new Event('input'));
//     inputElement.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter', key: 'Enter', keyCode: 13 } as any));
//   });

//   it('should emit value after click create button', () => {
//     const hostElement = fixture.nativeElement;
//     const createBtn: HTMLButtonElement = hostElement.querySelector('button');
//     component.control.patchValue('Trace');
//     component.createTraceEvent.subscribe(res => {
//       expect(res).toEqual('Trace');
//     });
//     createBtn.dispatchEvent(new Event('input'));
//     createBtn.dispatchEvent(new Event('click'));
//   });
});
