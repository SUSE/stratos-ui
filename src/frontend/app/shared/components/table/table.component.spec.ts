import { IListPaginationController } from '../../data-sources/list-pagination-controller';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatPaginatorIntl } from '@angular/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable } from 'rxjs/Rx';

import { CoreModule } from '../../../core/core.module';
import { TableCellEntryPoints } from '../../../test-framework/list-table-helper';
import { createBasicStoreModule } from '../../../test-framework/store-test-helper';
import { IListDataSource } from '../../data-sources/list-data-source-types';
import { ValuesPipe } from '../../pipes/values.pipe';
import { EventTabActorIconPipe } from './custom-cells/table-cell-event-action/event-tab-actor-icon.pipe';
import { TableCellComponent } from './table-cell/table-cell.component';
import { TableComponent } from './table.component';
import { ITableColumn } from './table.types';
import { ApplicationStateComponent } from '../../../shared/components/application-state/application-state.component';
import {
  ApplicationStateIconComponent
} from '../../../shared/components/application-state/application-state-icon/application-state-icon.component';
import {
  ApplicationStateIconPipe
} from '../../../shared/components/application-state/application-state-icon/application-state-icon.pipe';
import { ListSort } from '../../../store/actions/list.actions';
import { ListAppEnvVar } from '../../data-sources/cf-app-variables-data-source';
import { PercentagePipe } from '../../pipes/percentage.pipe';
import { UtilsService } from '../../../core/utils.service';
import { UsageGaugeComponent } from '../usage-gauge/usage-gauge.component';
import { CdkTableModule } from '@angular/cdk/table';
import { TableRowComponent } from './table-row/table-row.component';
import { RunningInstancesComponent } from '../running-instances/running-instances.component';


describe('TableComponent', () => {
  let component: TableComponent<ListAppEnvVar>;
  let fixture: ComponentFixture<TableComponent<ListAppEnvVar>>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ...TableCellEntryPoints,
        TableComponent,
        TableCellComponent,
        EventTabActorIconPipe,
        ValuesPipe,
        ApplicationStateComponent,
        ApplicationStateIconComponent,
        ApplicationStateIconPipe,
        UsageGaugeComponent,
        PercentagePipe,
        TableRowComponent,
        RunningInstancesComponent
      ],
      imports: [
        CoreModule,
        CdkTableModule,
        NoopAnimationsModule,
        createBasicStoreModule(),
      ],
      providers: [
        UtilsService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;

    const mdPaginatorIntl: MatPaginatorIntl = new MatPaginatorIntl();
    component.columns = new Array<ITableColumn<any>>();
    component.paginationController = {
      sort$: Observable.of({} as ListSort)
    } as IListPaginationController<any>;
    component.dataSource = {
      connect() { return Observable.of([]); },
    } as IListDataSource<ListAppEnvVar>;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
