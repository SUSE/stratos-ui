import { Component, OnInit } from '@angular/core';
import { Observable, of as observableOf } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { CurrentUserPermissions } from '../../../core/current-user-permissions.config';
import { CurrentUserPermissionsService } from '../../../core/current-user-permissions.service';
import { EndpointsService } from '../../../core/endpoints.service';
import {
  getActionsFromExtensions,
  getTabsFromExtensions,
  StratosActionMetadata,
  StratosActionType,
  StratosTabType,
} from '../../../core/extension/extension-service';
import { ISubHeaderTabs } from '../../../shared/components/page-subheader/page-subheader.types';
import { CloudFoundryEndpointService } from '../services/cloud-foundry-endpoint.service';

@Component({
  selector: 'app-cloud-foundry-tabs-base',
  templateUrl: './cloud-foundry-tabs-base.component.html',
  styleUrls: ['./cloud-foundry-tabs-base.component.scss']
})
export class CloudFoundryTabsBaseComponent implements OnInit {
  static firehose = 'firehose';
  static users = 'users';
  static cells = 'cells';

  public tabLinks: ISubHeaderTabs[];

  // Used to hide tab that is not yet implemented when in production
  isDevEnvironment = !environment.production;

  isFetching$: Observable<boolean>;

  public canAddOrg$: Observable<boolean>;

  public extensionActions: StratosActionMetadata[] = getActionsFromExtensions(StratosActionType.CloudFoundry);

  constructor(
    public cfEndpointService: CloudFoundryEndpointService,
    private currentUserPermissionsService: CurrentUserPermissionsService,
    endpointsService: EndpointsService
  ) {
    const firehoseHidden$ = this.currentUserPermissionsService
      .can(CurrentUserPermissions.FIREHOSE_VIEW, this.cfEndpointService.cfGuid)
      .pipe(map(visible => !visible));

    const usersHidden$ = cfEndpointService.users$.pipe(
      startWith(null),
      map(users => !users)
    );

    const cellsHidden$ = endpointsService.hasMetrics(cfEndpointService.cfGuid).pipe(
      map(hasMetrics => !hasMetrics)
    );

    // Default tabs + add any tabs from extensions
    this.tabLinks = [
      { link: 'summary', label: 'Summary' },
      { link: 'organizations', label: 'Organizations' },
      {
        link: CloudFoundryTabsBaseComponent.cells,
        label: 'Cells',
        hidden: cellsHidden$
      },
      { link: 'routes', label: 'Routes' },
      {
        link: CloudFoundryTabsBaseComponent.users,
        label: 'Users',
        hidden: usersHidden$
      },
      {
        link: CloudFoundryTabsBaseComponent.firehose,
        label: 'Firehose',
        hidden: firehoseHidden$
      },
      { link: 'feature-flags', label: 'Feature Flags' },
      { link: 'build-packs', label: 'Build Packs' },
      { link: 'stacks', label: 'Stacks' },
      { link: 'security-groups', label: 'Security Groups' }
    ].concat(getTabsFromExtensions(StratosTabType.CloudFoundry));
  }

  ngOnInit() {
    this.isFetching$ = observableOf(false);
    this.canAddOrg$ = this.currentUserPermissionsService.can(CurrentUserPermissions.ORGANIZATION_CREATE, this.cfEndpointService.cfGuid);
  }

}
