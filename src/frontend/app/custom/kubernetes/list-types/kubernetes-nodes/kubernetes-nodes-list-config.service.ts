import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngrx/store';

import { ITableColumn } from '../../../../shared/components/list/list-table/table.types';
import { IListConfig, ListViewTypes } from '../../../../shared/components/list/list.component.types';
import { AppState } from '../../../../store/app-state';
import { BaseKubeGuid } from '../../kubernetes-page.types';
import { KubernetesNodeCapacityComponent } from './kubernetes-node-capacity/kubernetes-node-capacity.component';
import { KubernetesNodesDataSource } from './kubernetes-nodes-data-source';
import { KubernetesNode, ConditionType } from '../../../../../../../src/frontend/app/custom/kubernetes/store/kube.types';
import { KubernetesNodeLinkComponent } from './kubernetes-node-link/kubernetes-node-link.component';
import { ConditionCellComponent } from './condition-cell/condition-cell.component';
import { getConditionSort } from '../kube-sort.helper';

@Injectable()
export class KubernetesNodesListConfigService implements IListConfig<KubernetesNode> {
  nodesDataSource: KubernetesNodesDataSource;

  columns: Array<ITableColumn<KubernetesNode>> = [
    {
      columnId: 'name', headerCell: () => 'ID',
      cellComponent: KubernetesNodeLinkComponent,
      sort: {
        type: 'sort',
        orderKey: 'name',
        field: 'metadata.name'
      },
      cellFlex: '5',
    },
    {
      columnId: 'ready', headerCell: () => 'Ready',
      cellConfig: {
        conditionType: ConditionType.Ready
      },
      cellComponent: ConditionCellComponent,

      sort: getConditionSort(ConditionType.Ready),
      cellFlex: '2',
    },
    {
      columnId: 'diskPressure', headerCell: () => 'Disk Pressure',
      cellComponent: ConditionCellComponent,
      cellConfig: {
        conditionType: ConditionType.DiskPressure
      },
      sort: getConditionSort(ConditionType.DiskPressure),
      cellFlex: '2',
    },
    {
      columnId: 'memPressure', headerCell: () => 'Memory Pressure',
      cellComponent: ConditionCellComponent,
      cellConfig: {
        conditionType: ConditionType.MemoryPressure
      },
      sort: getConditionSort(ConditionType.MemoryPressure),
      cellFlex: '2',
    },
    {
      columnId: 'capacity', headerCell: () => 'Capacity',
      cellComponent: KubernetesNodeCapacityComponent,
      cellFlex: '5',
    },
  ];

  pageSizeOptions = [9, 45, 90];
  viewType = ListViewTypes.TABLE_ONLY;

  enableTextFilter = false;

  getGlobalActions = () => null;
  getMultiActions = () => [];
  getSingleActions = () => [];
  getColumns = () => this.columns;
  getDataSource = () => this.nodesDataSource;
  getMultiFiltersConfigs = () => [];

  constructor(
    private store: Store<AppState>,
    private activatedRoute: ActivatedRoute,
    private kubeId: BaseKubeGuid,
  ) {
    this.nodesDataSource = new KubernetesNodesDataSource(this.store, kubeId, this);
  }

}
