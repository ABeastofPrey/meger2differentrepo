import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[clickOnce]',
})
export class ClickOnceDirective {
  @Input('clickOnce') clickOnce: Function;
  @Input('clickOnceContext') clickOnceContext: any;

  constructor() {}

  @HostListener('click', ['$event']) onClick($event: MouseEvent) {
    const el = (<HTMLElement>$event.target).parentElement;
    if (el.hasAttribute('disabled')) return;
    if (this.clickOnce && this.clickOnceContext) {
      el.setAttribute('disabled', 'true');
      (<Promise<any>>this.clickOnce.call(this.clickOnceContext)).then(() => {
        el.removeAttribute('disabled');
      });
    }
  }
}
