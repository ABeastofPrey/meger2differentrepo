import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewDialogTemplateComponent } from './new-dialog-template.component';

describe('NewDialogTemplateComponent', () => {
    let component: NewDialogTemplateComponent;
    let fixture: ComponentFixture<NewDialogTemplateComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [NewDialogTemplateComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(NewDialogTemplateComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
