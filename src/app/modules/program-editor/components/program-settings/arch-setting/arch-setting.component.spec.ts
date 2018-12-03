import { element } from 'protractor';
import { ArchSettingComponent } from './arch-setting.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ArchSettingService } from '../../../services/arch-setting.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NO_ERRORS_SCHEMA, DebugElement } from '@angular/core';
import { TestBed, async, ComponentFixture, ComponentFixtureAutoDetect } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ArchElement } from './arch-setting.component';
import * as Faker from 'faker';
import { range, map } from 'ramda';

describe('ArchSettingComponent', () => {
    let fixture: ComponentFixture<ArchSettingComponent>;
    let comp: ArchSettingComponent;
    let elem: DebugElement;
    let inputs: HTMLInputElement[];

    // Initial fake data with randomly.
    const fakeData: ArchElement[] = map(n => {
      return {
        index: n,
        depart: Faker.random.number({ min: 0, max: 100 }),
        approach: Faker.random.number({ min: 0, max: 100 })
      } as ArchElement;
    }, range(1, 8));
    const archSettingService = jasmine.createSpyObj('ArchSettingService', ['getInitTable', 'resetTable', 'setArch']);
    const getInitTableSpy = archSettingService.getInitTable.and.returnValue(fakeData);
    const setArchSpy = archSettingService.setArch;
    const resetTableSpy = archSettingService.resetTable;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ArchSettingComponent],
            imports: [SharedModule, BrowserAnimationsModule],
            providers: [{ provide: ArchSettingService, useValue: archSettingService },
              { provide: ComponentFixtureAutoDetect, useValue: true }],
            schemas: [NO_ERRORS_SCHEMA]
        });
    });

    beforeEach(async(() => {
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(ArchSettingComponent);
            comp = fixture.componentInstance;
        });
    }));

    it('should retrive the fake data after on init.', async(() => {
      fixture.detectChanges();
      expect(getInitTableSpy.calls.any()).toBe(true, 'getInitTableSpy called');
      fixture.whenStable().then(() => {
        expect(comp.dataSource).toBe(fakeData);
      });
    }));

    it('should display the correct fake values.', async(() => {
      fixture.whenStable().then(() => {
        inputs = map(
          (input: DebugElement) => input.nativeElement,
          fixture.debugElement.queryAll(By.css('input'))
        );
        expect(inputs.length).toEqual(fakeData.length * 2);
        expect(inputs[0].value).toEqual(fakeData[0].depart.toString());
        expect(inputs[1].value).toEqual(fakeData[0].approach.toString());
      });
    }));

    it('check boundary value for first departZ.', async(() => {
      fixture.whenStable().then(() => {
        const hostElement = fixture.nativeElement;
        const input = hostElement.querySelector('input');
        const eve = { target: { value: input.value } };
        let preValue = input.value;
        comp.onKeydown(eve);
        // simulate user input invalid number -10.
        input.value = '-10';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(input.value).toBe('-10');
        eve.target.value = input.value;
        comp.onBlur(eve, '0', input.value, '1');
        expect(setArchSpy.calls.any()).toBe(false, 'setArchSpy should not be called');
        input.value = preValue;
        fixture.detectChanges();
        expect(input.value).toEqual(preValue);
        // simulate user input invalid charaters 'aaa'.
        preValue = input.value;
        eve.target.value = preValue;
        comp.onKeydown(eve);
        input.value = 'aaa';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(input.value).toBe('aaa');
        eve.target.value = input.value;
        comp.onBlur(eve, '0', input.value, '1');
        expect(setArchSpy.calls.any()).toBe(false, 'setArchSpy should not be called');
        input.value = preValue;
        fixture.detectChanges();
        expect(input.value).toEqual(preValue);
        // simulate user input valid number 0.
        preValue = input.value;
        eve.target.value = preValue;
        comp.onKeydown(eve);
        input.value = '0';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(input.value).toBe('0');
        eve.target.value = input.value;
        comp.onBlur(eve, '0', input.value, '1');
        expect(setArchSpy.calls.any()).toBe(true, 'setArchSpy should not be called');
        expect(input.value).toEqual('0');
        // simulate user input valid number 10.
        preValue = input.value;
        eve.target.value = preValue;
        comp.onKeydown(eve);
        input.value = '10';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expect(input.value).toBe('10');
        eve.target.value = input.value;
        comp.onBlur(eve, '0', input.value, '1');
        expect(setArchSpy.calls.any()).toBe(true, 'setArchSpy should not be called');
        expect(input.value).toEqual('10');
      });
    }));

    it ('should call resetTable api to fetch init data.', async(() => {
      fixture.whenStable().then(() => {
        comp.onReset(null);
        expect(resetTableSpy.calls.any()).toBe(true, 'resetTableSpy should be called.');
        expect(getInitTableSpy.calls.any()).toBe(true, 'getInitTableSpy should be called.');
      });
    }));
});
