import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-doalog',
  templateUrl: './confirmation-doalog.component.html',
  styleUrls: ['./confirmation-doalog.component.scss']
})
export class ConfirmationDoalogComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: number) {}

  ngOnInit(): void {
  }

}
