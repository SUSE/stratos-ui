import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { UtilsService } from '../../../../../core/utils.service';
import { ListView } from '../../../../../store/actions/list.actions';
import { AppState } from '../../../../../store/app-state';
import { APIResource } from '../../../../../store/types/api.types';
import { CfOrgSpaceDataService, CfOrgSpaceItem } from '../../../../data-services/cf-org-space-service.service';
import { ApplicationStateService } from '../../../application-state/application-state.service';
import { ITableColumn } from '../../list-table/table.types';
import { IListConfig, IListMultiFilterConfig, ListConfig, ListViewTypes } from '../../list.component.types';
import { CardAppComponent } from './card/card-app.component';
import { CfAppsDataSource } from './cf-apps-data-source';
import { TableCellAppInstancesComponent } from './table-cell-app-instances/table-cell-app-instances.component';
import { TableCellAppNameComponent } from './table-cell-app-name/table-cell-app-name.component';
import { TableCellAppStatusComponent } from './table-cell-app-status/table-cell-app-status.component';


@Injectable()
export class CfAppConfigService extends ListConfig<APIResource> implements IListConfig<APIResource> {

  multiFilterConfigs: IListMultiFilterConfig[];

  constructor(
    private datePipe: DatePipe,
    private store: Store<AppState>,
    private utilsService: UtilsService,
    private appStateService: ApplicationStateService,
    private cfOrgSpaceService: CfOrgSpaceDataService
  ) {
    super();
    this.appsDataSource = new CfAppsDataSource(this.store, this);

    this.multiFilterConfigs = [
      this.createConfig('cf', 'Cloud Foundry', this.cfOrgSpaceService.cf),
      this.createConfig('org', 'Organisation', this.cfOrgSpaceService.org),
      this.createConfig('space', 'Space', this.cfOrgSpaceService.space),
    ];
  }
  appsDataSource: CfAppsDataSource;
  columns: Array<ITableColumn<APIResource>> = [
    {
      columnId: 'name', headerCell: () => 'Application Name', cellComponent: TableCellAppNameComponent, cellFlex: '2', sort: {
        type: 'sort',
        orderKey: 'name',
        field: 'entity.name'
      }
    },
    {
      columnId: 'status', headerCell: () => 'Status', cellFlex: '2', cellComponent: TableCellAppStatusComponent,
    },
    {
      columnId: 'instances', headerCell: () => 'Instances', cellComponent: TableCellAppInstancesComponent, cellFlex: '1', sort: {
        type: 'sort',
        orderKey: 'instances',
        field: 'entity.instances'
      }
    },
    {
      columnId: 'disk', headerCell: () => 'Disk Quota',
      cell: (row: APIResource) => `${this.utilsService.mbToHumanSize(row.entity.disk_quota)}`, cellFlex: '1', sort: {
        type: 'sort',
        orderKey: 'disk_quota',
        field: 'entity.disk_quota'
      }
    },
    {
      columnId: 'memory', headerCell: () => 'Memory',
      cell: (row: APIResource) => `${this.utilsService.mbToHumanSize(row.entity.memory)}`, cellFlex: '1', sort: {
        type: 'sort',
        orderKey: 'memory',
        field: 'entity.memory'
      }
    },
    {
      columnId: 'creation', headerCell: () => 'Creation Date',
      cell: (row: APIResource) => `${this.datePipe.transform(row.metadata.created_at, 'medium')}`, sort: {
        type: 'sort',
        orderKey: 'creation',
        field: 'metadata.created_at'
      },
      cellFlex: '2'
    },
  ];
  pageSizeOptions = [9, 45, 90];
  viewType = ListViewTypes.BOTH;
  text = {
    title: '',
    filter: 'Search by name'
  };
  enableTextFilter = true;
  cardComponent = CardAppComponent;
  defaultView = 'cards' as ListView;

  getGlobalActions = () => null;
  getMultiActions = () => null;
  getSingleActions = () => null;
  getColumns = () => this.columns;
  getDataSource = () => this.appsDataSource;
  getMultiFiltersConfigs = () => this.multiFilterConfigs;

  private createConfig(key: string, label: string, cfOrgSpaceItem: CfOrgSpaceItem) {
    return {
      key: key,
      label: label,
      ...cfOrgSpaceItem,
      list$: cfOrgSpaceItem.list$.map((entities: any[]) => {
        return entities.map(entity => ({
          label: entity.name,
          item: entity,
          value: entity.guid
        }));
      }),
    };
  }

}
