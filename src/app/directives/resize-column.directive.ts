import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appResizeColumn]'
})
export class ResizeColumnDirective implements OnInit {
  @Input('appResizeColumn') resizable: boolean = false;
  @Input() index!: number;

  private startX!: number;
  private startWidth!: number;
  private column!: HTMLElement;
  private table!: HTMLElement;
  private pressed!: boolean;

  constructor(private renderer: Renderer2, private el: ElementRef) {
    this.column = this.el.nativeElement;
  }

  ngOnInit(): void {
    if (this.resizable) {
      const row = this.renderer.parentNode(this.column);
      // const thead = this.renderer.parentNode(row)  => if in HTML <th mat-header-cell *matHeaderRpwDef> - it will find <thead>
      this.table = this.renderer.parentNode(row);

      const resizer = this.renderer.createElement('span');
      this.renderer.addClass(resizer, 'resize-holder');
      this.renderer.appendChild(this.column, resizer);

      this.renderer.listen(resizer, "mousedown", this.onMouseDown);
      this.renderer.listen(this.table, "mousemove", this.onMouseMove);
      this.renderer.listen("document", "mouseup", this.onMouseUp);
    }

    if (localStorage.getItem('mat-col-name-width')) {
      const width = (JSON.parse(localStorage.getItem('mat-col-name-width')!));
      this.column.classList.contains('mat-column-name') ? this.column.style.width = width + 'px' : 'false';
    }

    if (localStorage.getItem('mat-col-email-width')) {
      const width = (JSON.parse(localStorage.getItem('mat-col-email-width')!));
      this.column.classList.contains('mat-column-email') ? this.column.style.width = width + 'px' : 'false';
    }

    if (localStorage.getItem('mat-col-phone-width')) {
      const width = (JSON.parse(localStorage.getItem('mat-col-phone-width')!));
      this.column.classList.contains('mat-column-phone') ? this.column.style.width = width + 'px' : 'false';
    }

  }

  onMouseDown = (event: MouseEvent) => {
    this.pressed = true;
    this.startX = event.pageX;
    this.startWidth = this.column.offsetWidth;
  };

  onMouseMove = (event: MouseEvent) => {
    const offset = 35;
    if (this.pressed && event.buttons) {
      this.renderer.addClass(this.table, "resizing");

      // Calculate width of column
      let width = this.startWidth + (event.pageX - this.startX - offset);

      // Set table header width
      this.renderer.setStyle(this.column, "width", `${width}px`);

      // const tableCells = Array.from(this.table.querySelectorAll(".mat-mdc-row")).map(
      //   (row: any) => row.querySelectorAll(".mat-mdc-cell").item(this.index)
      // );

      // Set table cells width
      // for (const cell of tableCells) {
      //   this.renderer.setStyle(cell, "width", `${width}px`);
      // }
    }
  };

  onMouseUp = (event: MouseEvent) => {
    if (this.pressed) {
      this.pressed = false;
      this.renderer.removeClass(this.table, "resizing");

      if (this.column.classList.contains('mat-column-name')) {
        localStorage.setItem('mat-col-name-width', JSON.stringify(this.column.offsetWidth));
      }
      if (this.column.classList.contains('mat-column-email')) {
        localStorage.setItem('mat-col-email-width', JSON.stringify(this.column.offsetWidth));
      }
      if (this.column.classList.contains('mat-column-phone')) {
        localStorage.setItem('mat-col-phone-width', JSON.stringify(this.column.offsetWidth));
      }
    }
  };
}
