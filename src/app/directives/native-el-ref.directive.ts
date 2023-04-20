import { Directive, ElementRef, OnInit, Optional } from '@angular/core';
import { FormControlName, NgControl, NgModel } from '@angular/forms';

@Directive({
  selector: '[ngModel], [formControlName]',
  // or 'input, select, textarea' - but then your controls won't be handled and also checking for undefined would be necessary
})
export class NativeElRefDirective implements OnInit {
  constructor(
    private el: ElementRef,
    private control: FormControlName,
    @Optional() private model: NgModel
  ) {}
  ngOnInit(): void {
    if (!!this.model) {
      (<any>this.model.control).nativeElement = this.el.nativeElement;
    } else {
      (<any>this.control).control.nativeElement = this.el.nativeElement;
    }
  }
}
