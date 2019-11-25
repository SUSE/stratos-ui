import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

import { APIResource, EntityInfo } from '../../../../../store/src/types/api.types';
import { endpointListKey, EndpointModel } from '../../../../../store/src/types/endpoint.types';
import { endpointEntitySchema } from '../../../base-entity-schemas';
import { PaginationMonitor } from '../../../shared/monitors/pagination-monitor';
import { PaginationMonitorFactory } from '../../../shared/monitors/pagination-monitor.factory';

@Injectable()
export class KubernetesService {
  kubeEndpoints$: Observable<EndpointModel[]>;
  kubeEndpointsMonitor: PaginationMonitor<EndpointModel>;
  waitForAppEntity$: Observable<EntityInfo<APIResource>>;

  constructor(
    private paginationMonitorFactory: PaginationMonitorFactory
  ) {
    this.kubeEndpointsMonitor = this.paginationMonitorFactory.create(
      endpointListKey,
      endpointEntitySchema
    );

    this.kubeEndpoints$ = this.kubeEndpointsMonitor.currentPage$.pipe(
      map(endpoints => endpoints.filter(e => e.cnsi_type === 'k8s')),
      shareReplay(1)
    );
  }
}