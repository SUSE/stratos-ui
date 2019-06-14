import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest as observableCombineLatest, Observable, of as observableOf, Subscription } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { cfEntityFactory, spaceEntityType } from '../../../../../../../../cloud-foundry/src/cf-entity-factory';
import { ISpaceFavMetadata } from '../../../../../../../../cloud-foundry/src/cf-metadata-types';
import { RouterNav } from '../../../../../../../../store/src/actions/router.actions';
import { CFAppState } from '../../../../../../../../store/src/app-state';
import { APIResource } from '../../../../../../../../store/src/types/api.types';
import { EndpointUser } from '../../../../../../../../store/src/types/endpoint.types';
import { UserFavorite } from '../../../../../../../../store/src/types/user-favorites.types';
import { IApp, ISpace } from '../../../../../../core/cf-api.types';
import { getStartedAppInstanceCount } from '../../../../../../core/cf.helpers';
import { CurrentUserPermissions } from '../../../../../../core/current-user-permissions.config';
import { CurrentUserPermissionsService } from '../../../../../../core/current-user-permissions.service';
import { getFavoriteFromCfEntity } from '../../../../../../core/user-favorite-helpers';
import { truthyIncludingZeroString } from '../../../../../../core/utils.service';
import { getSpaceRolesString } from '../../../../../../features/cloud-foundry/cf.helpers';
import {
  CloudFoundryEndpointService,
} from '../../../../../../features/cloud-foundry/services/cloud-foundry-endpoint.service';
import {
  CloudFoundryOrganizationService,
  createQuotaDefinition,
} from '../../../../../../features/cloud-foundry/services/cloud-foundry-organization.service';
import { SpaceQuotaHelper } from '../../../../../../features/cloud-foundry/services/cloud-foundry-space-quota';
import { CfUserService } from '../../../../../data-services/cf-user.service';
import { EntityMonitorFactory } from '../../../../../monitors/entity-monitor.factory.service';
import { PaginationMonitorFactory } from '../../../../../monitors/pagination-monitor.factory';
import { ComponentEntityMonitorConfig, StratosStatus } from '../../../../../shared.types';
import { ConfirmationDialogConfig } from '../../../../confirmation-dialog.config';
import { ConfirmationDialogService } from '../../../../confirmation-dialog.service';
import { FavoritesConfigMapper } from '../../../../favorites-meta-card/favorite-config-mapper';
import { MetaCardMenuItem } from '../../../list-cards/meta-card/meta-card-base/meta-card.component';
import { CardCell } from '../../../list.types';

@Component({
  selector: 'app-cf-space-card',
  templateUrl: './cf-space-card.component.html',
  styleUrls: ['./cf-space-card.component.scss']
})
export class CfSpaceCardComponent extends CardCell<APIResource<ISpace>> implements OnInit, OnDestroy {
  cardMenu: MetaCardMenuItem[];
  spaceGuid: string;
  appInstancesCount: number;
  appInstancesLimit: string;
  orgGuid: string;
  normalisedMemoryUsage: number;
  memoryLimit: string;
  subscriptions: Subscription[] = [];
  memoryTotal: number;
  appCount$: Observable<number>;
  userRolesInSpace: string;
  currentUser$: Observable<EndpointUser>;
  entityConfig: ComponentEntityMonitorConfig;
  favorite: UserFavorite<ISpaceFavMetadata>;
  spaceStatus$: Observable<StratosStatus>;

  constructor(
    private cfUserService: CfUserService,
    public cfEndpointService: CloudFoundryEndpointService,
    private store: Store<CFAppState>,
    private cfOrgService: CloudFoundryOrganizationService,
    private currentUserPermissionsService: CurrentUserPermissionsService,
    private confirmDialog: ConfirmationDialogService,
    private paginationMonitorFactory: PaginationMonitorFactory,
    private emf: EntityMonitorFactory,
    private favoritesConfigMapper: FavoritesConfigMapper
  ) {
    super();
  }

  ngOnInit() {
    this.spaceGuid = this.row.metadata.guid;
    this.entityConfig = new ComponentEntityMonitorConfig(this.spaceGuid, cfEntityFactory(spaceEntityType));
    this.orgGuid = this.cfOrgService.orgGuid;
    this.favorite = getFavoriteFromCfEntity(this.row, spaceEntityType, this.favoritesConfigMapper);
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

    const allApps$: Observable<APIResource<IApp>[]> = this.cfEndpointService.appsPagObs.hasEntities$.pipe(
      switchMap(hasAll => hasAll ? this.cfEndpointService.getAppsInSpaceViaAllApps(this.row) : observableOf(null))
    );

    this.appCount$ = allApps$.pipe(
      switchMap(allApps => allApps ? observableOf(allApps.length) : CloudFoundryEndpointService.fetchAppCount(
        this.store,
        this.paginationMonitorFactory,
        this.cfEndpointService.cfGuid,
        this.orgGuid,
        this.row.metadata.guid
      ))
    );

    const fetchData$ = observableCombineLatest(
      userRole$,
      allApps$
    ).pipe(
      tap(([role, apps]) => {
        this.setValues(role, apps);
      })
    );

    this.subscriptions.push(fetchData$.subscribe());

    const spaceQuotaHelper = new SpaceQuotaHelper(this.cfEndpointService, this.emf, this.spaceGuid);
    this.spaceStatus$ = spaceQuotaHelper.createStateObs();
  }

  setAppsDependentCounts = (apps: APIResource<IApp>[]) => {
    this.appInstancesCount = getStartedAppInstanceCount(apps);
  }

  setValues = (roles: string, apps: APIResource<IApp>[]) => {
    this.userRolesInSpace = roles;
    const quotaDefinition = this.row.entity.space_quota_definition ?
      this.row.entity.space_quota_definition.entity : createQuotaDefinition(this.orgGuid);
    if (apps) {
      this.setAppsDependentCounts(apps);
      this.memoryTotal = this.cfEndpointService.getMetricFromApps(apps, 'memory');
      this.normalisedMemoryUsage = this.memoryTotal / quotaDefinition.memory_limit * 100;
    }
    this.appInstancesLimit = truthyIncludingZeroString(quotaDefinition.app_instance_limit);
    this.memoryLimit = truthyIncludingZeroString(quotaDefinition.memory_limit);
  }

  ngOnDestroy = () => this.subscriptions.forEach(p => p.unsubscribe());

  edit = () => {
    this.store.dispatch(
      new RouterNav({
        path: [
          'cloud-foundry', this.cfEndpointService.cfGuid, 'organizations', this.orgGuid, 'spaces', this.spaceGuid, 'edit-space'
        ]
      })
    );
  }

  delete = () => {
    const confirmation = new ConfirmationDialogConfig(
      'Delete Space',
      {
        textToMatch: this.row.entity.name
      },
      'Delete',
      true
    );
    this.confirmDialog.open(confirmation, () => {
      this.cfOrgService.deleteSpace(
        this.spaceGuid,
        this.orgGuid,
        this.cfEndpointService.cfGuid
      );
    });
  }

  goToSummary = () => this.store.dispatch(new RouterNav({
    path: ['cloud-foundry', this.cfEndpointService.cfGuid, 'organizations', this.orgGuid, 'spaces', this.spaceGuid]
  }))
}
