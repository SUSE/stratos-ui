import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../store/app-state';
import { EntityServiceFactory } from '../../../core/entity-service-factory.service';
import { EntityService } from '../../../core/entity-service';
import { Observable } from 'rxjs/Observable';
import { EntityInfo, APIResource } from '../../../store/types/api.types';
import { switchMap, shareReplay, tap, filter, map } from 'rxjs/operators';
import { PaginationMonitorFactory } from '../../../shared/monitors/pagination-monitor.factory';
import { PaginationMonitor } from '../../../shared/monitors/pagination-monitor';
import { EndpointModel } from '../../../store/types/endpoint.types';
import { getFullEndpointApiUrl } from '../../endpoints/endpoint-helpers';
import { endpointSchemaKey, entityFactory } from '../../../store/helpers/entity-factory';

export interface MetricsEndpointProvider {
  provider: EndpointModel;
  endpoints: EndpointModel[];
}

@Injectable()
export class MetricsService {
  metricsEndpoints$: Observable<MetricsEndpointProvider[]>;
  endpointsMonitor: PaginationMonitor<EndpointModel>;
  waitForAppEntity$: Observable<EntityInfo<APIResource>>;
  haveNoMetricsEndpoints$: Observable<boolean>;

  constructor(
    private store: Store<AppState>,
    private paginationMonitorFactory: PaginationMonitorFactory
  ) {
    this.endpointsMonitor = this.paginationMonitorFactory.create(
      'endpoint-list',
      entityFactory(endpointSchemaKey)
    );

    this.metricsEndpoints$ = this.endpointsMonitor.currentPage$.pipe(
      map((endpoints: any) => {
        const result: MetricsEndpointProvider[] = [];
        const metrics = endpoints.filter(e => e.cnsi_type === 'metrics');
        metrics.forEach(ep => {
          const provider: MetricsEndpointProvider = {
            provider: ep,
            endpoints: [],
          };
          endpoints.forEach(e => {
            if (e.metadata && e.metadata.metrics && e.metadata.metrics === ep.guid) {
              provider.endpoints.push(e);
              e.url = getFullEndpointApiUrl(e);
            }
          });
          result.push(provider);
        });
        return result;
      }),
      shareReplay(1)
    );

    this.haveNoMetricsEndpoints$ = this.endpointsMonitor.currentPage$.pipe(
      map((endpoints: any) => {
        const metrics = endpoints.filter(e => e.cnsi_type === 'metrics');
        console.log('HELLO');
        console.log(metrics);
        console.log(metrics.length === 0);
        return metrics.length === 0;
      })
    );
  }

}
