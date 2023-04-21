import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Subject, map, takeUntil } from 'rxjs';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatIconRegistry } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { SelectionModel } from '@angular/cdk/collections';

import { UsersService } from './users.service';
import { User } from './models/users.model';
import { ConfirmationDoalogComponent } from './confirmation-doalog/confirmation-doalog.component';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<User>;

  private readonly unsubscribe$: Subject<void> = new Subject();
  error!: string;

  displayedColumns: string[] = ['select', 'name', 'email', 'phone', 'actions'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  selection = new SelectionModel<User>(true, []);

  form!: FormGroup;
  isLoading = true;

  constructor(
    private userService: UsersService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private _MatPaginatorIntl: MatPaginatorIntl,
    public dialog: MatDialog,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    this.iconRegistry.addSvgIconSet(
      this.sanitizer.bypassSecurityTrustResourceUrl(
        './assets/images/icons/set.svg'
      )
    );
  }

  ngOnInit(): void {
    /**
     * getting users from api or localStorage
     */
    if (localStorage.getItem('users') === null) {
      this.userService
        .getUsers()
        .pipe(
          takeUntil(this.unsubscribe$),
          map((users) =>
            users.map((user: User) => ({
              name: `${user.name} ${user.surname}`,
              email: user.email,
              phone: user.phone,
            }))
          )
        )
        .subscribe({
          next: (data) => {
            localStorage.setItem('users', JSON.stringify(data));

            this.form = new FormGroup({
              rows: new FormArray(
                data.map((user: any) => {
                  return this.fb.group({
                    name: new FormControl(user.name, [
                      Validators.required,
                      Validators.maxLength(255),
                      Validators.pattern(/^[А-Яа-яёЁ]+(?:[\s][А-Яа-яёЁ]+)*$/)
                    ],),
                    email: new FormControl(user.email,[Validators.required, Validators.email]),
                    phone: new FormControl(user.phone),
                    action: new FormControl('existingRecod'),
                    isEditable: new FormControl(true),
                    isNewRow: new FormControl(false),
                  });
                })
              ),
            });
            this.isLoading = false;

            this.dataSource.data = (this.form.get('rows') as FormArray).controls;
          },
          error: (e) => {
            if ((e.status = 404)) {
              this.error = 'Не удалось загрузить даные с сервера. Ошибка 404';
            } else {
              this.error = 'Не удалось загрузить даные';
            }
          },
        });
    } else {
      this.form = new FormGroup({
        rows: new FormArray(
          JSON.parse(localStorage.getItem('users')!).map((user: any) => {
            return this.fb.group({
              name: new FormControl(user.name, [
                  Validators.required,
                  Validators.maxLength(255),
                  Validators.pattern(/^[А-Яа-яёЁ]+(?:[\s][А-Яа-яёЁ]+)*$/)//only cirilic and space between words
                ]),
              email: new FormControl(user.email,[Validators.required, Validators.email]),
              phone: new FormControl(user.phone),
              action: new FormControl('existingRecod'),
              isEditable: new FormControl(true),
              isNewRow: new FormControl(false),
            });
          })
        ),
      });

      this.dataSource.data = (this.form.get('rows') as FormArray).controls;
    }

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this._MatPaginatorIntl.itemsPerPageLabel = 'Строк на странице';
    this._MatPaginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) {
        return `0 из ${length}`;
      }
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} из ${length}`;
    };
  }

  removeSelectedRows() {
    const dialogRef = this.dialog.open(ConfirmationDoalogComponent, {
      panelClass: 'dialogConfirmation',
      data: this.selection.selected.length,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selection.selected.forEach((selectedUser) => {
          let index: number = this.dataSource.data.findIndex((user) => user === selectedUser);
          (this.form.get('rows') as FormArray).removeAt(index);

          const users = JSON.parse(localStorage.getItem('users')!);
          users.splice(index, 1);
          localStorage.setItem('users', JSON.stringify(users));

          this.dataSource.data = (this.form.get('rows') as FormArray).controls;

        });
        this.dataSource.paginator = this.paginator;
        this.selection = new SelectionModel<any>(true, []);
      }
    });
  }

  addRow() {
    const control = this.form.get('rows') as FormArray;

    control.insert(0, this.initiateForm());
    this.dataSource = new MatTableDataSource(control.controls);
    this.cd.detectChanges();
    this.dataSource.data[0].get("name").nativeElement.focus();
    this.dataSource.paginator = this.paginator;
  }

  initiateForm() {
    return this.fb.group({
      name: new FormControl('', [
        Validators.required,
        Validators.maxLength(255),
        Validators.pattern(/^[А-Яа-яёЁ]+(?:[\s][А-Яа-яёЁ]+)*$/)
      ],),
      email: new FormControl('',[Validators.required, Validators.email]),
      phone: new FormControl(''),
      action: new FormControl('newRecod'),
      isEditable: new FormControl(false),
      isNewRow: new FormControl(true),
    });
  }

  editRow(event: Event, index: number, form: any) {
    event.stopPropagation();
    form.get('rows').at(index).get('isEditable').patchValue(false);
  }

  saveChanges(event: Event, index: number, form: any) {
    event.stopPropagation();
    form.valueChanges
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: any) => {
        localStorage.setItem('users', JSON.stringify(data.rows));
      });

    form.get('rows').at(index).get('isEditable').patchValue(true);
  }

  canselChanges(event: Event, index: number, form: any) {
    event.stopPropagation();
    //patching prev value of the row formGroup
    form.get('rows').at(index).patchValue(JSON.parse(localStorage.getItem('users')!)[index]);
    form.get('rows').at(index).get('isEditable').patchValue(true);
  }

  stopProp(e: Event) {
    e.stopPropagation();
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
