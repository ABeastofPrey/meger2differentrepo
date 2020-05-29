import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DropDownAddComponent } from './drop-down-add.component';

describe('DropDownAddComponent', () => {
    let component: DropDownAddComponent;
    let fixture: ComponentFixture<DropDownAddComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [DropDownAddComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(DropDownAddComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
