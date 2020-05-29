import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpFormFieldComponent } from './ip-form-field.component';

describe('IpFormFieldComponent', () => {
    let component: IpFormFieldComponent;
    let fixture: ComponentFixture<IpFormFieldComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [IpFormFieldComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(IpFormFieldComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
