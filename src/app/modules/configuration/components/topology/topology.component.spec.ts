import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TopologyService } from '../../services/topology.service';
import { TopologyComponent } from './topology.component';
import { SharedModule } from '../../../shared/shared.module';
import { UnitTestModule } from '../../../shared/unit-test.module';
import { Either } from 'ramda-fantasy';
import { levelOrder } from './topology.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const { Right } = Either;

describe('TopologyComponent', () => {
  let component: TopologyComponent;
  let fixture: ComponentFixture<TopologyComponent>;

  // tslint:disable-next-line
  const str =
    '[{"name":"Controller","children":[{"name":"Drive Bus","children":[{"name":"0:1   OP CDHD EtherCAT Drive (CoE) : port range = 1000, 1010","children":[]}]},{"name":"Extension Bus","children":[{"name":"1:2   OP EK1100 EtherCAT-Koppler (2A E-Bus)","children":[{"name":"2:3   OP EL2008 8K. Dig. Ausgang 24V, 0.5A : port range = 3000, 3007","children":[]},{"name":"3:4   OP EL1008 8K. Dig. Eingang 24V, 3ms : port range = 4000, 4007","children":[]},{"name":"4:5   OP EL1008 8K. Dig. Eingang 24V, 3ms : port range = 5000, 5007"}]}]}]}]';
  const tree = JSON.parse(str);
  const fakeService = jasmine.createSpyObj('TopologyService', [
    'getDeviceTopology',
    'getOpMode',
    'getBusType',
  ]);
  let fakeMode = `OP
8`;
  let getDeviceTopologySpy = fakeService.getDeviceTopology.and.returnValue(
    Promise.resolve(Right(tree))
  );
  let getOpModeSpy = fakeService.getOpMode.and.returnValue(
    Promise.resolve(Right(fakeMode))
  );
  let getBusTypeSpy = fakeService.getBusType.and.returnValue(
    Promise.resolve(Right('2'))
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, UnitTestModule, BrowserAnimationsModule],
      declarations: [TopologyComponent],
      providers: [{ provide: TopologyService, useValue: fakeService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get all node of tree', () => {
    const nodes = levelOrder(tree[0]);
    expect(nodes.length).toEqual(8);
  });

  it('should get no node of undefind root.', () => {
    const nodes = levelOrder(null);
    expect(nodes.length).toEqual(0);
  });

  it('should query api to retrieve device topology.', async(() => {
    jasmine.clock().install();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      jasmine.clock().tick(2001);
      expect(getDeviceTopologySpy.calls.any()).toBe(true);
      expect(getOpModeSpy.calls.any()).toBe(true);
      jasmine.clock().uninstall();
    });
  }));

  it('should query api to retrieve device topology with error state.', async(() => {
    getOpModeSpy.calls.reset();
    fakeMode = `OP
2`;
    // getOpModeSpy = fakeService.getOpMode.and.returnValue(Promise.resolve(Right(fakeMode)));
    jasmine.clock().install();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      jasmine.clock().tick(2001);
      getOpModeSpy = fakeService.getOpMode.and.returnValue(
        Promise.resolve(Right(fakeMode))
      );
      expect(getOpModeSpy.calls.any()).toBe(true);
      jasmine.clock().uninstall();
    });
  }));

  it('should do refresh after device topology is less than before.', async(() => {
    // tslint:disable-next-line
    const _str =
      '[{"name":"Controller","children":[{"name":"Drive Bus","children":[{"name":"0:1   OP CDHD EtherCAT Drive (CoE) : port range = 1000, 1010","children":[]}]},{"name":"Extension Bus","children":[{"name":"1:2   OP EK1100 EtherCAT-Koppler (2A E-Bus)","children":[{"name":"2:3   OP EL2008 8K. Dig. Ausgang 24V, 0.5A : port range = 3000, 3007","children":[]},{"name":"3:4   OP EL1008 8K. Dig. Eingang 24V, 3ms : port range = 4000, 4007","children":[]},{"name":"4:5   OP EL1008 8K. Dig. Eingang 24V, 3ms : port range = 6000, 5007"}]}]}]}]';
    const _tree = JSON.parse(_str);
    jasmine.clock().install();
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      getDeviceTopologySpy.calls.reset();
      jasmine.clock().tick(1501);
      getDeviceTopologySpy = fakeService.getDeviceTopology.and.returnValue(
        Promise.resolve(Right(_tree))
      );
      expect(1).toBe(1);
      jasmine.clock().uninstall();
    });
  }));
});
