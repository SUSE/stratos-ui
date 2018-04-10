import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';

import { SetClientFilter } from '../../store/actions/pagination.actions';
import { RouterNav } from '../../store/actions/router.actions';
import { AppState } from '../../store/app-state';
import { applicationSchemaKey } from '../../store/helpers/entity-factory';
import { APIResource } from '../../store/types/api.types';
import { CfUser, UserRoleInOrg, UserRoleInSpace } from '../../store/types/user.types';
import { ActiveRouteCfOrgSpace } from './cf-page.types';
import { selectPaginationState } from '../../store/selectors/pagination.selectors';
import { takeWhile, takeUntil, filter, first, tap, skipUntil } from 'rxjs/operators';
import { PaginationState, PaginationEntityState } from '../../store/types/pagination.types';
import { getPath } from '../../helper';
import { pathGet } from '../../core/utils.service';

export enum OrgUserRoles {
  MANAGER = 'manager',
  BILLING_MANAGERS = 'billing_manager',
  AUDITOR = 'auditor',
  USER = 'user'
}
export enum SpaceUserRoles {
  MANAGER = 'manager',
  AUDITOR = 'auditor',
  DEVELOPER = 'developer'
}

export interface IUserRole<T> {
  string: string;
  key: T;
}

export function getOrgRolesString(userRolesInOrg: UserRoleInOrg): string {
  let roles = null;
  if (userRolesInOrg.orgManager) {
    roles = 'Manager';
  }
  if (userRolesInOrg.billingManager) {
    roles = assignRole(roles, 'Billing Manager');
  }
  if (userRolesInOrg.auditor) {
    roles = assignRole(roles, 'Auditor');

  }
  if (userRolesInOrg.user && !userRolesInOrg.orgManager) {
    roles = assignRole(roles, 'User');
  }

  return roles ? roles : 'None';
}
export function getSpaceRolesString(userRolesInSpace: UserRoleInSpace): string {
  let roles = null;
  if (userRolesInSpace.manager) {
    roles = 'Manager';
  }
  if (userRolesInSpace.auditor) {
    roles = assignRole(roles, 'Auditor');

  }
  if (userRolesInSpace.developer) {
    roles = assignRole(roles, 'Developer');
  }

  return roles ? roles : 'None';
}

export function getOrgRoles(userRolesInOrg: UserRoleInOrg): IUserRole<OrgUserRoles>[] {
  const roles = [];
  if (userRolesInOrg.orgManager) {
    roles.push({
      string: 'Manager',
      key: OrgUserRoles.MANAGER
    });
  }
  if (userRolesInOrg.billingManager) {
    roles.push({
      string: 'Billing Manager',
      key: OrgUserRoles.BILLING_MANAGERS
    });
  }
  if (userRolesInOrg.auditor) {
    roles.push({
      string: 'Auditor',
      key: OrgUserRoles.AUDITOR
    });
  }
  if (userRolesInOrg.user) {
    roles.push({
      string: 'User',
      key: OrgUserRoles.USER
    });
  }
  return roles;
}

export function getSpaceRoles(userRolesInSpace: UserRoleInSpace): IUserRole<SpaceUserRoles>[] {
  const roles = [];
  if (userRolesInSpace.manager) {
    roles.push({
      string: 'Manager',
      key: SpaceUserRoles.MANAGER
    });
  }
  if (userRolesInSpace.auditor) {
    roles.push({
      string: 'Auditor',
      key: SpaceUserRoles.AUDITOR
    });
  }
  if (userRolesInSpace.developer) {
    roles.push({
      string: 'Developer',
      key: SpaceUserRoles.DEVELOPER
    });
  }
  return roles;
}

function assignRole(currentRoles: string, role: string) {
  const newRoles = currentRoles ? `${currentRoles}, ${role}` : role;
  return newRoles;
}

export function isOrgManager(user: CfUser, guid: string): boolean {
  return hasRole(user, guid, 'managed_organizations');
}

export function isOrgBillingManager(user: CfUser, guid: string): boolean {
  return hasRole(user, guid, 'billing_managed_organizations');
}

export function isOrgAuditor(user: CfUser, guid: string): boolean {
  return hasRole(user, guid, 'audited_organizations');
}

export function isOrgUser(user: CfUser, guid: string): boolean {
  return hasRole(user, guid, 'organizations');
}

export function isSpaceManager(user: CfUser, spaceGuid: string): boolean {
  return hasRole(user, spaceGuid, 'managed_spaces');
}

export function isSpaceAuditor(user: CfUser, spaceGuid: string): boolean {
  return hasRole(user, spaceGuid, 'audited_spaces');
}

export function isSpaceDeveloper(user: CfUser, spaceGuid: string): boolean {
  return hasRole(user, spaceGuid, 'spaces');
}

function hasRole(user: CfUser, guid: string, roleType: string) {
  if (user[roleType]) {
    const roles = user[roleType] as APIResource[];
    return !!roles.find(o => o.metadata.guid === guid);
  }
  return false;
}

export const getRowMetadata = (entity: APIResource) => entity.metadata ? entity.metadata.guid : null;

export function getIdFromRoute(activatedRoute: ActivatedRoute, id: string) {
  if (activatedRoute.snapshot.params[id]) {
    return activatedRoute.snapshot.params[id];
  } else if (activatedRoute.parent) {
    return getIdFromRoute(activatedRoute.parent, id);
  }
  return null;
}

export function getActiveRouteCfOrgSpace(activatedRoute: ActivatedRoute) {
  return ({
    cfGuid: getIdFromRoute(activatedRoute, 'cfId'),
    orgGuid: getIdFromRoute(activatedRoute, 'orgId'),
    spaceGuid: getIdFromRoute(activatedRoute, 'spaceId')
  });
}

export const getActiveRouteCfOrgSpaceProvider = {
  provide: ActiveRouteCfOrgSpace,
  useFactory: getActiveRouteCfOrgSpace,
  deps: [
    ActivatedRoute,
  ]
};

export function goToAppWall(store: Store<AppState>, cfGuid: string, orgGuid?: string, spaceGuid?: string) {
  const appWallPagKey = 'applicationWall';
  store.dispatch(new SetClientFilter(applicationSchemaKey, appWallPagKey,
    {
      string: '',
      items: {
        cf: cfGuid,
        org: orgGuid,
        space: spaceGuid
      }
    }
  ));
  store.select(selectPaginationState(applicationSchemaKey, appWallPagKey)).pipe(
    filter((state: PaginationEntityState) => {
      const items = pathGet('clientPagination.filter.items', state);
      return items ? items.cf === cfGuid && items.org === orgGuid && items.space === spaceGuid : false;
    }),
    first(),
    tap(() => {
      store.dispatch(new RouterNav({ path: ['applications'] }));
    })
  ).subscribe();
}
