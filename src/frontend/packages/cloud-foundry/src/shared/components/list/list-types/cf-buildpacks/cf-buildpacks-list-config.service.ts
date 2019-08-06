import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { CFAppState } from '../../../../../../../cloud-foundry/src/cf-app-state';
import { IBuildpack } from '../../../../../../../core/src/core/cf-api.types';
import { ITableColumn } from '../../../../../../../core/src/shared/components/list/list-table/table.types';
import {
  BaseCfListConfig,
} from '../../../../../../../core/src/shared/components/list/list-types/base-cf/base-cf-list-config';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { ActiveRouteCfOrgSpace } from '../../../../../features/cloud-foundry/cf-page.types';
import { CfBuildpackCardComponent } from './cf-buildpack-card/cf-buildpack-card.component';
import { CfBuildpacksDataSource } from './cf-buildpacks-data-source';

@Injectable()
export class CfBuildpacksListConfigService extends BaseCfListConfig<APIResource<IBuildpack>> {
  cardComponent = CfBuildpackCardComponent;
  dataSource: CfBuildpacksDataSource;
  isLocal = true;
  enableTextFilter = true;
  text = {
    title: null,
    filter: 'Search by name',
    noEntries: 'There are no buildpacks'
  };
  columns: ITableColumn<APIResource>[] = [{
    columnId: 'position',
    headerCell: () => 'Position',
    sort: {
      type: 'sort',
      orderKey: 'position',
      field: 'entity.position'
    },
  }, {
    columnId: 'name',
    headerCell: () => 'Name',
    sort: {
      type: 'sort',
      orderKey: 'name',
      field: 'entity.name'
    }
  }, {
    columnId: 'createdAt',
    headerCell: () => 'Creation',
    sort: {
      type: 'sort',
      orderKey: 'createdAt',
      field: 'metadata.created_at'
    },
  }];
  constructor(private store: Store<CFAppState>, private activeRouteCfOrgSpace: ActiveRouteCfOrgSpace) {
    super();
    this.dataSource = new CfBuildpacksDataSource(this.store, activeRouteCfOrgSpace.cfGuid, this);
  }
  getColumns = () => this.columns;
  getDataSource = () => this.dataSource;
}