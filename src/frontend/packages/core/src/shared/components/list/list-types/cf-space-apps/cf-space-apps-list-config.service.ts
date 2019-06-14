import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { applicationEntityType } from '../../../../../../../cloud-foundry/src/cf-entity-factory';
import { ISpaceFavMetadata } from '../../../../../../../cloud-foundry/src/cf-metadata-types';
import { ListView } from '../../../../../../../store/src/actions/list.actions';
import { CFAppState } from '../../../../../../../store/src/app-state';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { UserFavorite } from '../../../../../../../store/src/types/user-favorites.types';
import { IApp } from '../../../../../core/cf-api.types';
import { CloudFoundrySpaceService } from '../../../../../features/cloud-foundry/services/cloud-foundry-space.service';
import { createTableColumnFavorite } from '../../list-table/table-cell-favorite/table-cell-favorite.component';
import { ITableColumn } from '../../list-table/table.types';
import { defaultPaginationPageSizeOptionsTable, IListConfig, ListViewTypes } from '../../list.component.types';
import { TableCellAppNameComponent } from '../app/table-cell-app-name/table-cell-app-name.component';
import { TableCellAppStatusComponent } from '../app/table-cell-app-status/table-cell-app-status.component';
import { CfSpaceAppsDataSource } from './cf-space-apps-data-source.service';

@Injectable()
export class CfSpaceAppsListConfigService implements IListConfig<APIResource> {
  isLocal = false;
  viewType = ListViewTypes.TABLE_ONLY;
  enableTextFilter = false;
  dataSource: CfSpaceAppsDataSource;
  defaultView = 'table' as ListView;
  text = {
    title: null,
    noEntries: 'There are no applications'
  };
  pageSizeOptions = defaultPaginationPageSizeOptionsTable;

  getColumns = (): ITableColumn<APIResource<IApp>>[] => [
    {
      columnId: 'apps', headerCell: () => 'Applications',
      cellComponent: TableCellAppNameComponent,
      cellFlex: '1',
    },
    {
      columnId: 'status',
      headerCell: () => 'Status',
      cellFlex: '2',
      cellConfig: {
        hideIcon: true,
        initialStateOnly: true
      },
      cellComponent: TableCellAppStatusComponent
    },
    {
      columnId: 'instances',
      headerCell: () => 'Instances',
      cellDefinition: {
        getValue: (row: APIResource) => `${row.entity.instances}`
      },
      cellFlex: '1'
    },
    {
      columnId: 'creation', headerCell: () => 'Creation Date',
      cellDefinition: {
        getValue: (row: APIResource) => `${this.datePipe.transform(row.metadata.created_at, 'medium')}`
      },
      sort: {
        type: 'sort',
        orderKey: 'creation',
        field: 'metadata.created_at'
      },
      cellFlex: '2'
    },
    createTableColumnFavorite((row: APIResource<IApp>): UserFavorite<ISpaceFavMetadata> => {
      return new UserFavorite(
        row.entity.cfGuid,
        'cf',
        applicationEntityType,
        row.entity.guid,
      );
    }),
  ]

  constructor(
    private store: Store<CFAppState>,
    private datePipe: DatePipe,
    private cfSpaceService: CloudFoundrySpaceService
  ) {
    this.dataSource = new CfSpaceAppsDataSource(this.store, cfSpaceService, this);
  }

  getGlobalActions = () => [];
  getMultiActions = () => [];
  getSingleActions = () => [];
  getMultiFiltersConfigs = () => [];
  getDataSource = () => this.dataSource;
}
