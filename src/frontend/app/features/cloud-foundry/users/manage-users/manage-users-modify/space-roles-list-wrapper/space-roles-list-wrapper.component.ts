import { Component } from '@angular/core';
import { Store } from '@ngrx/store';

import {
  CfUsersSpaceRolesListConfigService,
} from '../../../../../../shared/components/list/list-types/cf-users-org-space-roles/cf-users-space-roles-list-config.service';
import { ListConfig } from '../../../../../../shared/components/list/list.component.types';
import { AppState } from '../../../../../../store/app-state';
import { ActiveRouteCfOrgSpace } from '../../../../cf-page.types';
import { CurrentUserPermissionsService } from '../../../../../../core/current-user-permissions.service';

@Component({
  selector: 'app-space-roles-list-wrapper',
  templateUrl: './space-roles-list-wrapper.component.html',
  styleUrls: ['./space-roles-list-wrapper.component.scss'],
  providers: [
    {
      provide: ListConfig,
      useFactory: (
        store: Store<AppState>,
        activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
        userPerms: CurrentUserPermissionsService) => {
        return new CfUsersSpaceRolesListConfigService(store, activeRouteCfOrgSpace.cfGuid, activeRouteCfOrgSpace.spaceGuid, userPerms);
      },
      deps: [Store, ActiveRouteCfOrgSpace, CurrentUserPermissionsService]
    }
  ]
})
export class SpaceRolesListWrapperComponent { }
