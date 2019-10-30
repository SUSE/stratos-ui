import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { filter, first, map, publishReplay, refCount, switchMap } from 'rxjs/operators';

import { GetAllApplications } from '../../../../../cloud-foundry/src/actions/application.actions';
import { DeleteOrganization, GetAllOrganizations } from '../../../../../cloud-foundry/src/actions/organization.actions';
import { CFAppState } from '../../../../../cloud-foundry/src/cf-app-state';
import {
  cfInfoEntityType,
  domainEntityType,
  organizationEntityType,
  privateDomainsEntityType,
  quotaDefinitionEntityType,
  routeEntityType,
  spaceEntityType,
} from '../../../../../cloud-foundry/src/cf-entity-types';
import {
  createEntityRelationKey,
  createEntityRelationPaginationKey,
} from '../../../../../cloud-foundry/src/entity-relations/entity-relations.types';
import { CfApplicationState } from '../../../../../cloud-foundry/src/store/types/application.types';
import { IApp, ICfV2Info, IOrganization, ISpace } from '../../../../../core/src/core/cf-api.types';
import { EndpointsService } from '../../../../../core/src/core/endpoints.service';
import { entityCatalogue } from '../../../../../core/src/core/entity-catalogue/entity-catalogue.service';
import { EntityService } from '../../../../../core/src/core/entity-service';
import { EntityServiceFactory } from '../../../../../core/src/core/entity-service-factory.service';
import { PaginationMonitorFactory } from '../../../../../core/src/shared/monitors/pagination-monitor.factory';
import { MetricQueryType } from '../../../../../core/src/shared/services/metrics-range-selector.types';
import { GetAllEndpoints } from '../../../../../store/src/actions/endpoint.actions';
import { MetricQueryConfig } from '../../../../../store/src/actions/metrics.actions';
import { endpointSchemaKey } from '../../../../../store/src/helpers/entity-factory';
import { QParam, QParamJoiners } from '../../../../../store/src/q-param';
import {
  getPaginationObservables,
  PaginationObservables,
} from '../../../../../store/src/reducers/pagination-reducer/pagination-reducer.helper';
import { APIResource, EntityInfo } from '../../../../../store/src/types/api.types';
import { IMetrics } from '../../../../../store/src/types/base-metric.types';
import { EndpointModel, EndpointUser } from '../../../../../store/src/types/endpoint.types';
import { PaginatedAction } from '../../../../../store/src/types/pagination.types';
import { CF_ENDPOINT_TYPE } from '../../../../cf-types';
import { FetchCFCellMetricsPaginatedAction } from '../../../actions/cf-metrics.actions';
import { cfEntityFactory } from '../../../cf-entity-factory';
import { CfInfoDefinitionActionBuilders } from '../../../entity-action-builders/cf-info.action-builders';
import { CfUserService } from '../../../shared/data-services/cf-user.service';
import { ActiveRouteCfOrgSpace } from '../cf-page.types';
import { fetchTotalResults } from '../cf.helpers';

export function appDataSort(app1: APIResource<IApp>, app2: APIResource<IApp>): number {
  const app1Date = new Date(app1.metadata.updated_at);
  const app2Date = new Date(app2.metadata.updated_at);
  if (app1Date > app2Date) {
    return -1;
  }
  if (app1Date < app2Date) {
    return 1;
  }
  return 0;
}


@Injectable()
export class CloudFoundryEndpointService {

  hasSSHAccess$: Observable<boolean>;
  totalMem$: Observable<number>;
  paginationSubscription: any;
  appsPagObs: PaginationObservables<APIResource<IApp>>;
  usersCount$: Observable<number | null>;
  orgs$: Observable<APIResource<IOrganization>[]>;
  info$: Observable<EntityInfo<APIResource<ICfV2Info>>>;
  cfInfoEntityService: EntityService<APIResource<ICfV2Info>>;
  endpoint$: Observable<EntityInfo<EndpointModel>>;
  cfEndpointEntityService: EntityService<EndpointModel>;
  connected$: Observable<boolean>;
  currentUser$: Observable<EndpointUser>;
  cfGuid: string;

  getAllOrgsAction: GetAllOrganizations;

  private getAllAppsAction: GetAllApplications;

  static createGetAllOrganizations(cfGuid: string) {
    const paginationKey = cfGuid ?
      createEntityRelationPaginationKey(endpointSchemaKey, cfGuid)
      : createEntityRelationPaginationKey(endpointSchemaKey);
    const organizationEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, organizationEntityType);
    const actionBuilder = organizationEntity.actionOrchestrator.getActionBuilder('getMultiple');
    const getAllOrganizationsAction = actionBuilder(cfGuid, paginationKey,
      {
        includeRelations: [
          createEntityRelationKey(organizationEntityType, spaceEntityType),
          createEntityRelationKey(organizationEntityType, domainEntityType),
          createEntityRelationKey(organizationEntityType, quotaDefinitionEntityType),
          createEntityRelationKey(organizationEntityType, privateDomainsEntityType),
          createEntityRelationKey(spaceEntityType, routeEntityType), // Not really needed at top level, but if we drop down into an org with
          // lots of spaces it saves spaces x routes requests
        ], populateMissing: false
      }) as PaginatedAction;
    return getAllOrganizationsAction;
  }
  static createGetAllOrganizationsLimitedSchema(cfGuid: string) {
    const paginationKey = cfGuid ?
      createEntityRelationPaginationKey(endpointSchemaKey, cfGuid)
      : createEntityRelationPaginationKey(endpointSchemaKey);
    const organizationEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, organizationEntityType);
    const actionBuilder = organizationEntity.actionOrchestrator.getActionBuilder('getMultiple');
    const getAllOrganizationsAction = actionBuilder(cfGuid, paginationKey,
      {
        includeRelations: [
          createEntityRelationKey(organizationEntityType, spaceEntityType),
        ]
      }) as PaginatedAction;
    return getAllOrganizationsAction;
  }

  public static fetchAppCount(store: Store<CFAppState>, pmf: PaginationMonitorFactory, cfGuid: string, orgGuid?: string, spaceGuid?: string)
    : Observable<number> {
    const parentSchemaKey = spaceGuid ? spaceEntityType : orgGuid ? organizationEntityType : 'cf';
    const uniqueKey = spaceGuid || orgGuid || cfGuid;
    const action = new GetAllApplications(createEntityRelationPaginationKey(parentSchemaKey, uniqueKey), cfGuid);
    action.initialParams = {};
    action.initialParams.q = [];
    if (orgGuid) {
      action.initialParams.q.push(new QParam('organization_guid', orgGuid, QParamJoiners.in).toString());
    }
    if (spaceGuid) {
      action.initialParams.q.push(new QParam('space_guid', spaceGuid, QParamJoiners.in).toString());
    }
    return fetchTotalResults(action, store, pmf);
  }

  constructor(
    public activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
    private store: Store<CFAppState>,
    private entityServiceFactory: EntityServiceFactory,
    private cfUserService: CfUserService,
    private pmf: PaginationMonitorFactory,
    private endpointService: EndpointsService,
    private paginationMonitorFactory: PaginationMonitorFactory
  ) {
    this.cfGuid = activeRouteCfOrgSpace.cfGuid;
    this.getAllOrgsAction = CloudFoundryEndpointService.createGetAllOrganizations(this.cfGuid) as GetAllOrganizations;
    this.getAllAppsAction = new GetAllApplications(createEntityRelationPaginationKey('cf', this.cfGuid), this.cfGuid);

    this.cfEndpointEntityService = this.entityServiceFactory.create(
      this.cfGuid,
      new GetAllEndpoints()
    );

    const cfInfoEntity = entityCatalogue.getEntity<any, any, CfInfoDefinitionActionBuilders>(CF_ENDPOINT_TYPE, cfInfoEntityType);
    const actionBuilder = cfInfoEntity.actionOrchestrator.getActionBuilder('get');
    const action = actionBuilder(this.cfGuid);
    this.cfInfoEntityService = this.entityServiceFactory.create<APIResource<ICfV2Info>>(
      this.cfGuid,
      action,
    );
    this.constructCoreObservables();
    this.constructSecondaryObservable();
  }

  private constructCoreObservables() {
    this.endpoint$ = this.cfEndpointEntityService.waitForEntity$;

    this.orgs$ = getPaginationObservables<APIResource<IOrganization>>({
      store: this.store,
      action: this.getAllOrgsAction,
      paginationMonitor: this.pmf.create(
        this.getAllOrgsAction.paginationKey,
        cfEntityFactory(organizationEntityType)
      )
    }, true).entities$;

    this.info$ = this.cfInfoEntityService.waitForEntity$;

    this.usersCount$ = this.cfUserService.fetchTotalUsers(this.cfGuid);

    this.constructAppObs();

    this.fetchDomains();
  }

  constructAppObs() {
    const appPaginationMonitor = this.pmf.create(this.getAllAppsAction.paginationKey, this.getAllAppsAction);
    this.appsPagObs = getPaginationObservables<APIResource<IApp>>({
      store: this.store,
      action: this.getAllAppsAction,
      paginationMonitor: appPaginationMonitor
    });
  }

  private constructSecondaryObservable() {
    this.hasSSHAccess$ = this.info$.pipe(
      map(p => !!(p.entity.entity &&
        p.entity.entity.app_ssh_endpoint &&
        p.entity.entity.app_ssh_host_key_fingerprint &&
        p.entity.entity.app_ssh_oauth_client))
    );
    this.totalMem$ = this.appsPagObs.entities$.pipe(map(apps => this.getMetricFromApps(apps, 'memory')));

    this.connected$ = this.endpoint$.pipe(
      map(p => p.entity.connectionStatus === 'connected')
    );

    this.currentUser$ = this.endpoint$.pipe(map(e => e.entity.user), first(), publishReplay(1), refCount());
  }

  public getAppsInOrgViaAllApps(org: APIResource<IOrganization>): Observable<APIResource<IApp>[]> {
    return this.appsPagObs.entities$.pipe(
      filter(allApps => !!allApps),
      map(allApps => {
        const spaces = org.entity.spaces || [];
        const orgSpaces = spaces.map(s => s.metadata.guid);
        return allApps.filter(a => orgSpaces.indexOf(a.entity.space_guid) !== -1);
      })
    );
  }

  public getAppsInSpaceViaAllApps(space: APIResource<ISpace>): Observable<APIResource<IApp>[]> {
    return this.appsPagObs.entities$.pipe(
      filter(allApps => !!allApps),
      map(apps => {
        return apps.filter(a => a.entity.space_guid === space.metadata.guid);
      })
    );
  }

  public getMetricFromApps(apps: APIResource<IApp>[], statMetric: string): number {
    return apps ? apps
      .filter(a => a.entity && a.entity.state !== CfApplicationState.STOPPED)
      .map(a => a.entity[statMetric] * a.entity.instances)
      .reduce((a, t) => a + t, 0) : 0;
  }

  public fetchDomains = () => {
    const domainEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, domainEntityType);
    const actionBuilder = domainEntity.actionOrchestrator.getActionBuilder('getMultiple');
    const action = actionBuilder(this.cfGuid, null);
    this.paginationSubscription = getPaginationObservables<APIResource>(
      {
        store: this.store,
        action,
        paginationMonitor: this.pmf.create(
          action.paginationKey,
          cfEntityFactory(domainEntityType)
        )
      },
      true
    ).entities$.pipe(first()).subscribe();
  }

  public deleteOrg(orgGuid: string, endpointGuid: string) {
    this.store.dispatch(new DeleteOrganization(orgGuid, endpointGuid));
  }

  fetchApps() {
    this.store.dispatch(this.getAllAppsAction);
  }

  hasCellMetrics(endpointId: string): Observable<boolean> {
    return this.endpointService.hasMetrics(endpointId).pipe(
      switchMap(hasMetrics => {
        if (!hasMetrics) {
          return of(false);
        }

        // Check that we successfully retrieve some stats. If the metric is unknown an empty list is returned
        const action = new FetchCFCellMetricsPaginatedAction(
          endpointId,
          endpointId,
          new MetricQueryConfig('firehose_value_metric_rep_unhealthy_cell', {}),
          MetricQueryType.QUERY
        );

        return getPaginationObservables<IMetrics>({
          store: this.store,
          action,
          paginationMonitor: this.paginationMonitorFactory.create(
            action.paginationKey,
            action
          )
        }).entities$.pipe(
          filter(entities => !!entities && !!entities.length),
          map(entities => !!entities.find(entity => !!entity.data.result.length)),
          first()
        );
      })
    );
  }
}
