import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { ISpace } from '../../../../../../core/cf-api.types';
import { CurrentUserPermissionsService } from '../../../../../../core/current-user-permissions.service';
import { EntityServiceFactory } from '../../../../../../core/entity-service-factory.service';
import { getSpaceRolesString } from '../../../../../../features/cloud-foundry/cf.helpers';
import {
  CloudFoundryEndpointService,
} from '../../../../../../features/cloud-foundry/services/cloud-foundry-endpoint.service';
import {
  CloudFoundryOrganizationService,
} from '../../../../../../features/cloud-foundry/services/cloud-foundry-organization.service';
import { RouterNav } from '../../../../../../store/actions/router.actions';
import { AppState } from '../../../../../../store/app-state';
import { APIResource } from '../../../../../../store/types/api.types';
import { EndpointUser } from '../../../../../../store/types/endpoint.types';
import { CfUserService } from '../../../../../data-services/cf-user.service';
import { MetaCardMenuItem } from '../../../list-cards/meta-card/meta-card-base/meta-card.component';
import { CardCell } from '../../../list.types';
import { CurrentUserPermissions } from '../../../../../../core/current-user-permissions.config';
import { ComponentEntityMonitorConfig } from '../../../../../shared.types';
import { entityFactory, spaceSchemaKey } from '../../../../../../store/helpers/entity-factory';

@Component({
  selector: 'app-cf-space-card',
  templateUrl: './cf-space-card.component.html',
  styleUrls: ['./cf-space-card.component.scss']
})
export class CfSpaceCardComponent extends CardCell<APIResource<ISpace>> implements OnInit, OnDestroy {
  cardMenu: MetaCardMenuItem[];
  spaceGuid: string;
  serviceInstancesCount: number;
  appInstancesCount: number;
  serviceInstancesLimit: number;
  appIntancesLimit: number;
  orgGuid: string;
  normalisedMemoryUsage: number;
  memoryLimit: number;
  instancesLimit: number;
  subscriptions: Subscription[] = [];
  memoryTotal: number;
  orgApps$: Observable<APIResource<any>[]>;
  appCount: number;
  userRolesInSpace: string;
  currentUser$: Observable<EndpointUser>;
  entityConfig: ComponentEntityMonitorConfig;

  constructor(
    private cfUserService: CfUserService,
    private cfEndpointService: CloudFoundryEndpointService,
    private store: Store<AppState>,
    private cfOrgService: CloudFoundryOrganizationService,
    private currentUserPermissionsService: CurrentUserPermissionsService
  ) {
    super();
  }

  ngOnInit() {
    this.spaceGuid = this.row.metadata.guid;
    this.entityConfig = new ComponentEntityMonitorConfig(this.spaceGuid, entityFactory(spaceSchemaKey));
    this.orgGuid = this.cfOrgService.orgGuid;
    this.cardMenu = [
      {
        label: 'Edit',
        action: this.edit,
        can: this.currentUserPermissionsService.can(
          CurrentUserPermissions.SPACE_EDIT,
          this.cfEndpointService.cfGuid,
          this.orgGuid,
          this.spaceGuid
        )
      },
      {
        label: 'Delete',
        action: this.delete,
        can: this.currentUserPermissionsService.can(
          CurrentUserPermissions.SPACE_DELETE,
          this.cfEndpointService.cfGuid,
          this.orgGuid
        )
      }
    ];

    const userRole$ = this.cfEndpointService.currentUser$.pipe(
      switchMap(u => this.cfUserService.getUserRoleInSpace(
        u.guid,
        this.spaceGuid,
        this.cfEndpointService.cfGuid
      )),
      map(u => getSpaceRolesString(u))
    );

    const fetchData$ = userRole$.pipe(
      tap((roles) => {
        this.setValues(roles);
      })
    );

    this.subscriptions.push(fetchData$.subscribe());

  }

  setCounts = () => {
    this.appCount = this.row.entity.apps ? this.row.entity.apps.length : 0;
    let count = 0;
    if (this.appCount > 0) {
      this.row.entity.apps.forEach(a => {
        count += a.entity.instances;
      });
    } else {
      count = 0;
    }

    this.appInstancesCount = count;
    this.serviceInstancesCount = this.row.entity.service_instances ? this.row.entity.service_instances.length : 0;
  }

  setValues = (roles: string) => {
    this.userRolesInSpace = roles;
    this.setCounts();
    this.memoryTotal = this.cfEndpointService.getMetricFromApps(this.row.entity.apps, 'memory');
    let quotaDefinition = this.row.entity.space_quota_definition;
    if (!quotaDefinition) {
      quotaDefinition = {
        entity: {
          memory_limit: -1,
          app_instance_limit: -1,
          instance_memory_limit: -1,
          name: 'None assigned',
          organization_guid: this.orgGuid,
          total_services: -1,
          total_routes: -1
        },
        metadata: null
      };
    }
    this.appIntancesLimit = quotaDefinition.entity.app_instance_limit;
    this.serviceInstancesLimit = quotaDefinition.entity.total_services;
    this.memoryLimit = quotaDefinition.entity.memory_limit;
    this.normalisedMemoryUsage = this.memoryTotal / this.memoryLimit * 100;
  }

  ngOnDestroy = () => this.
    subscriptions.forEach(p =>
      p.unsubscribe())


  edit = () => {
    this.store.dispatch(
      new RouterNav({
        path: ['cloud-foundry', this.cfEndpointService.cfGuid, 'organizations', this.orgGuid, 'spaces', this.spaceGuid, 'edit-space']
      })
    );
  }

  delete = () => {
    this.cfOrgService.deleteSpace(
      this.spaceGuid,
      this.orgGuid,
      this.cfEndpointService.cfGuid
    );
  }

  goToSummary = () => this.store.dispatch(new RouterNav({
    path: ['cloud-foundry', this.cfEndpointService.cfGuid, 'organizations', this.orgGuid, 'spaces', this.spaceGuid]
  }))
}
