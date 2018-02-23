import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { map, switchMap, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { EntityServiceFactory } from '../../../../../../core/entity-service-factory.service';
import { getOrgRolesString } from '../../../../../../features/cloud-foundry/cf.helpers';
import {
  CloudFoundryEndpointService,
} from '../../../../../../features/cloud-foundry/cloud-foundry-base/cloud-foundry-endpoint.service';
import { RouterNav } from '../../../../../../store/actions/router.actions';
import { AppState } from '../../../../../../store/app-state';
import { APIResource } from '../../../../../../store/types/api.types';
import { CfApplication } from '../../../../../../store/types/application.types';
import { EndpointUser } from '../../../../../../store/types/endpoint.types';
import { CfOrg } from '../../../../../../store/types/org-and-space.types';
import { CfOrgSpaceDataService } from '../../../../../data-services/cf-org-space-service.service';
import { CfUserService } from '../../../../../data-services/cf-user.service';
import { TableCellCustom } from '../../../list-table/table-cell/table-cell-custom';

@Component({
  selector: 'app-cf-org-card',
  templateUrl: './cf-org-card.component.html',
  styleUrls: ['./cf-org-card.component.scss']
})
export class CfOrgCardComponent extends TableCellCustom<APIResource<CfOrg>>
  implements OnInit, OnDestroy {
  orgGuid: string;
  normalisedMemoryUsage: number;
  memoryLimit: number;
  instancesLimit: number;
  subscriptions: Subscription[] = [];
  memoryTotal: number;
  instancesCount: number;
  orgApps$: Observable<APIResource<any>[]>;
  appCount: number;
  userRolesInOrg: string;
  currentUser$: Observable<EndpointUser>;

  @Input('row') row: APIResource<CfOrg>;

  constructor(
    private cfUserService: CfUserService,
    private cfEndpointService: CloudFoundryEndpointService,
    private entityServiceFactory: EntityServiceFactory,
    private store: Store<AppState>,
    private cfOrgSpaceDataService: CfOrgSpaceDataService
  ) {
    super();
  }

  ngOnInit() {
    const userRole$ = this.cfEndpointService.currentUser$.pipe(
      switchMap(u => {
        // FIX ME: This is null if the endpoint is disconnected. Not sure we should init it if we're headed directly to org level?
        if (!u) {
          return Observable.of({
            orgManager: false,
            billingManager: false,
            auditor: false,
            user: false
          });
        }
        return this.cfUserService.getUserRoleInOrg(
          u.guid,
          this.row.entity.guid,
          this.row.entity.cfGuid
        );
      }),
      map(u => getOrgRolesString(u))
    );

    const fetchData$ = Observable.combineLatest(
      userRole$,
      this.cfEndpointService.getAppsInOrg(this.row)
    ).pipe(
      tap(([role, apps]) => {
        this.setValues(role, apps);
      })
    );

    this.subscriptions.push(fetchData$.subscribe());
    this.orgGuid = this.row.entity.guid;

  }

  setCounts = (apps: APIResource<any>[]) => {
    this.appCount = apps.length;
    let count = 0;
    apps.forEach(a => {
      count += a.entity.instances;
    });
    this.instancesCount = count;
  }

  setValues = (role: string, apps: APIResource<CfApplication>[]) => {
    this.userRolesInOrg = role;
    this.setCounts(apps);
    this.memoryTotal = this.cfEndpointService.getMetricFromApps(apps, 'memory');
    const quotaDefinition = this.row.entity.quota_definition;
    this.instancesLimit = quotaDefinition.entity.app_instance_limit;
    this.memoryLimit = quotaDefinition.entity.memory_limit;
    this.
      normalisedMemoryUsage = this.memoryTotal / this.memoryLimit * 100;
  }

  ngOnDestroy = () => this.
    subscriptions.forEach(p =>
      p.unsubscribe())


  edit = () => {
    this.store.dispatch(
      new RouterNav({
        path: ['cloud-foundry', this.cfEndpointService.cfGuid, 'edit-org']
      })
    );
  }

  delete = () => {
    this.cfOrgSpaceDataService.deleteOrg(
      this.row.entity.guid,
      this.cfEndpointService.cfGuid
    );
  }

  goToSummary = () => this.store.dispatch(new RouterNav({
    path: ['cloud-foundry', this.cfEndpointService.cfGuid, 'organizations', this.orgGuid, 'spaces']
  }))
}
