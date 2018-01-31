/* tslint:disable:no-access-missing-member https://github.com/mgechev/codelyzer/issues/191*/
import { Component, OnInit } from '@angular/core';
import { TableCellCustom } from '../../table-cell/table-cell-custom';

@Component({
  selector: 'app-table-cell-event-type',
  templateUrl: './table-cell-event-type.component.html',
  styleUrls: ['./table-cell-event-type.component.scss']
})
export class TableCellEventTypeComponent<T> extends TableCellCustom<T> { }
