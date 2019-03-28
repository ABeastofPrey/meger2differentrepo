import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TopologyService } from '../../services/topology.service';
import { TopologyComponent } from './topology.component';
import { SharedModule } from '../../../shared/shared.module';
import { Either } from 'ramda-fantasy';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
const { Right } = Either;

describe('TopologyComponent', () => {
    let component: TopologyComponent;
    let fixture: ComponentFixture<TopologyComponent>;

    // tslint:disable-next-line
    const str = '[{"name":"Controller","children":[{"name":"Drive Bus","children":[{"name":"0:1   OP CDHD EtherCAT Drive (CoE) : port range = 1000, 1010","children":[]}]},{"name":"Extension Bus","children":[{"name":"1:2   OP EK1100 EtherCAT-Koppler (2A E-Bus)","children":[{"name":"2:3   OP EL2008 8K. Dig. Ausgang 24V, 0.5A : port range = 3000, 3007","children":[]},{"name":"3:4   OP EL1008 8K. Dig. Eingang 24V, 3ms : port range = 4000, 4007","children":[]},{"name":"4:5   OP EL1008 8K. Dig. Eingang 24V, 3ms : port range = 5000, 5007","children":[]}]}]}]}]';
    const tree = JSON.parse(str);
    const fakeService = jasmine.createSpyObj('TopologyService', ['getDeviceTopology']);
    let getDeviceTopologySpy = fakeService.getDeviceTopology.and.returnValue(Promise.resolve(Right(tree)));

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [SharedModule, BrowserAnimationsModule],
            declarations: [TopologyComponent],
            providers: [{ provide: TopologyService, useValue: fakeService }]
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

    it('should query api to retrieve device topology.', async(() => {
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(getDeviceTopologySpy.calls.any()).toBe(true);
        });
    }));
});
