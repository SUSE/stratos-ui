import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { MetricQueryConfig } from '../../../../../store/src/actions/metrics.actions';
import { RouterNav } from '../../../../../store/src/actions/router.actions';
import { AppState } from '../../../../../store/src/app-state';
import { EntityServiceFactory } from '../../../../../store/src/entity-service-factory.service';
import { stratosEntityCatalog } from '../../../../../store/src/stratos-entity-catalog';
import { PluginConfig } from '../../../../../store/src/types/auth.types';
import { IMetricMatrixResult, IMetrics } from '../../../../../store/src/types/base-metric.types';
import { EndpointModel, EndpointsRelation } from '../../../../../store/src/types/endpoint.types';
import { IMetricApplication, MetricQueryType } from '../../../../../store/src/types/metric.types';
import { FetchCfEiriniMetricsAction } from '../../../actions/cf-metrics.actions';
import { CfRelationTypes } from '../../../cf-relation-types';

@Injectable()
export class EiriniContainerService {

  public defaultEiriniNamespace$: Observable<string>;

  constructor(
    private store: Store<AppState>,
    private entityServiceFactory: EntityServiceFactory,
  ) {
    this.defaultEiriniNamespace$ = EiriniContainerService.getPluginConfig(store).pipe(
      map(config => config.eiriniDefaultNamespace || null)
    );
  }

  public static eiriniEnabled(store: Store<AppState>): Observable<boolean> {
    return EiriniContainerService.getPluginConfig(store).pipe(
      map(config => config.eiriniEnabled === 'true'),
    );
  }

  private static getPluginConfig(store: Store<AppState>): Observable<PluginConfig> {
    return store.select('auth').pipe(
      map(auth => auth.sessionData ? auth.sessionData['plugin-config'] : null),
      filter(config => !!config)
    );
  }

  public static cfEiriniRelationship(cf: EndpointModel) {
    const relations = cf.relations ? cf.relations.receives : [];
    return relations.find(receive => receive.type === CfRelationTypes.METRICS_EIRINI);
  }

  public eiriniEnabled(): Observable<boolean> {
    return EiriniContainerService.eiriniEnabled(this.store);
  }

  public eiriniMetricsProvider(endpointId: string): Observable<EndpointsRelation> {
    const eiriniProvider$ = stratosEntityCatalog.endpoint.store.getEntityService(endpointId).waitForEntity$.pipe(
      map(em => EiriniContainerService.cfEiriniRelationship(em.entity))
    );
    return combineLatest([
      this.eiriniEnabled(),
      eiriniProvider$
    ]).pipe(
      map(([eirini, eiriniProvider]) => eirini ? eiriniProvider : null)
    );
  }

  configureEirini(cfGuid: string) {
    this.store.dispatch(new RouterNav({ path: `${cfGuid}/eirini`, query: { cf: true } }));
  }

  createEiriniPodService(cfGuid: string, appGuid: string, eiriniMetricsProvider: EndpointsRelation) {
    const metricsKey = `${cfGuid}:${appGuid}:appPods`;
    const action = new FetchCfEiriniMetricsAction(
      metricsKey,
      cfGuid,
      // tslint:disable-next-line:max-line-length
      new MetricQueryConfig(`kube_pod_labels{label_cloudfoundry_org_app_guid="${appGuid}",namespace="${eiriniMetricsProvider.metadata.namespace}"} / on(pod) group_right kube_pod_info`),
      MetricQueryType.QUERY
    );
    return this.entityServiceFactory.create<IMetrics<IMetricMatrixResult<IMetricApplication>>>(
      action.guid,
      action
    );
  }
}