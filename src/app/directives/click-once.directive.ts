import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[clickOnce]',
})
export class ClickOnceDirective {
  
  @Input('clickOnce') clickOnce?: Function;
  @Input('clickOnceContext') clickOnceContext: Function;

  constructor() {}

  @HostListener('click', ['$event']) onClick($event: MouseEvent) {
    const el = ($event.target as HTMLElement).parentElement;
    if (el === null || el.hasAttribute('disabled')) return;
    if (this.clickOnce && this.clickOnceContext) {
      el.setAttribute('disabled', 'true');
      (this.clickOnce.call(this.clickOnceContext)).then(() => {
        el.removeAttribute('disabled');
      });
    }
  }
}
