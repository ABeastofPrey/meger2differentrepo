import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TpStatService } from '../../../../modules/core/services/tp-stat.service';
import { HandGuidingComponent } from './hand-guiding.component';

describe('JogScreenComponent', () => {
  let component: HandGuidingComponent;
  let fixture: ComponentFixture<HandGuidingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HandGuidingComponent],
      providers: [TpStatService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HandGuidingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
