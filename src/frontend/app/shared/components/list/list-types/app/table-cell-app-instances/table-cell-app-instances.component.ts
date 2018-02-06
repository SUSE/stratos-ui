import { Component, OnInit } from '@angular/core';
import { TableCellCustom } from '../../../list-table/table-cell/table-cell-custom';

@Component({
  selector: 'app-table-cell-app-instances',
  templateUrl: './table-cell-app-instances.component.html',
  styleUrls: ['./table-cell-app-instances.component.scss']
})
export class TableCellAppInstancesComponent<T> extends TableCellCustom<T> { }
