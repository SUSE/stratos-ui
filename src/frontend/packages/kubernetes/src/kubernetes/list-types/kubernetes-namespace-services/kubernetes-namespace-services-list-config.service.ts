import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { IListConfig } from '../../../../../core/src/shared/components/list/list.component.types';
import { AppState } from '../../../../../store/src/public-api';
import { BaseKubeGuid } from '../../kubernetes-page.types';
import { KubernetesNamespaceService } from '../../services/kubernetes-namespace.service';
import { KubeService } from '../../store/kube.types';
import { BaseKubernetesServicesListConfig } from '../kubernetes-services/kubernetes-service-list-config.service';
import { KubernetesNamespaceServicesDataSource } from './kubernetes-namespace-services-data-source';

@Injectable()
export class KubernetesNamespaceServicesListConfig extends BaseKubernetesServicesListConfig implements IListConfig<KubeService> {
  dataSource: KubernetesNamespaceServicesDataSource;

  constructor(
    store: Store<AppState>,
    kubeId: BaseKubeGuid,
    kubeNamespaceService: KubernetesNamespaceService
  ) {
    super();
    this.dataSource = new KubernetesNamespaceServicesDataSource(store, kubeId, this, kubeNamespaceService.namespaceName);
  }
  getDataSource = () => this.dataSource;
}
