import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { ITableColumn } from '../../../../../core/src/shared/components/list/list-table/table.types';
import {
  BaseEndpointsDataSource,
} from '../../../../../core/src/shared/components/list/list-types/endpoint/base-endpoints-data-source';
import {
  EndpointCardComponent,
} from '../../../../../core/src/shared/components/list/list-types/endpoint/endpoint-card/endpoint-card.component';
import {
  EndpointsListConfigService,
} from '../../../../../core/src/shared/components/list/list-types/endpoint/endpoints-list-config.service';
import { IListConfig, ListViewTypes } from '../../../../../core/src/shared/components/list/list.component.types';
import { EntityMonitorFactory } from '../../../../../store/src/monitors/entity-monitor.factory.service';
import { InternalEventMonitorFactory } from '../../../../../store/src/monitors/internal-event-monitor.factory';
import { PaginationMonitorFactory } from '../../../../../store/src/monitors/pagination-monitor.factory';
import { AppState, EndpointModel } from '../../../../../store/src/public-api';
import { KubernetesEndpointsDataSource } from './kubernetes-endpoints-data-source';

@Injectable()
export class KubernetesEndpointsListConfigService implements IListConfig<EndpointModel> {
  columns: ITableColumn<EndpointModel>[];
  isLocal = true;
  dataSource: BaseEndpointsDataSource;
  viewType = ListViewTypes.CARD_ONLY;
  cardComponent = EndpointCardComponent;
  text = {
    title: '',
    filter: 'Filter Endpoints',
    noEntries: 'There are no endpoints'
  };
  enableTextFilter = true;


  constructor(
    private store: Store<AppState>,
    paginationMonitorFactory: PaginationMonitorFactory,
    entityMonitorFactory: EntityMonitorFactory,
    internalEventMonitorFactory: InternalEventMonitorFactory,
    endpointsListConfigService: EndpointsListConfigService,
  ) {
    this.columns = endpointsListConfigService.columns.filter(column => {
      return column.columnId !== 'type';
    });
    this.dataSource = new KubernetesEndpointsDataSource(
      this.store,
      this,
      paginationMonitorFactory,
      entityMonitorFactory,
      internalEventMonitorFactory,
    );
  }
  public getColumns = () => this.columns;
  public getGlobalActions = () => [];
  public getMultiActions = () => [];
  public getSingleActions = () => [];
  public getMultiFiltersConfigs = () => [];
  public getDataSource = () => this.dataSource;
}
