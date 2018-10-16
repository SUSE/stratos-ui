import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, publishReplay } from 'rxjs/operators';

import { EntityServiceFactory } from '../../../core/entity-service-factory.service';
import { getIdFromRoute } from '../../../features/cloud-foundry/cf.helpers';
import { PaginationMonitorFactory } from '../../../shared/monitors/pagination-monitor.factory';
import { AppState } from '../../../store/app-state';
import { entityFactory, kubernetesNamespacesSchemaKey } from '../../../store/helpers/entity-factory';
import { KubernetesNamespace } from '../store/kube.types';
import { GetKubernetesNamespace } from '../store/kubernetes.actions';
import { KubernetesEndpointService } from './kubernetes-endpoint.service';

@Injectable()
export class KubernetesNamespaceService {
  namespaceName: string;
  kubeGuid: string;
  namespace$: Observable<KubernetesNamespace>;

  constructor(
    public kubeEndpointService: KubernetesEndpointService,
    public activatedRoute: ActivatedRoute,
    public store: Store<AppState>,
    public paginationMonitorFactory: PaginationMonitorFactory,
    public entityServiceFactory: EntityServiceFactory,
  ) {

    this.namespaceName = getIdFromRoute(activatedRoute, 'namespaceName');
    this.kubeGuid = kubeEndpointService.kubeGuid;

    const namespaceEntity = this.entityServiceFactory.create<KubernetesNamespace>(
      kubernetesNamespacesSchemaKey,
      entityFactory(kubernetesNamespacesSchemaKey),
      this.namespaceName,
      new GetKubernetesNamespace(this.namespaceName, this.kubeGuid),
      false
    );

    this.namespace$ = namespaceEntity.entityObs$.pipe(
      filter(p => !!p),
      map(p => p.entity ),
      publishReplay(1),
      first()
    );

  }
}
