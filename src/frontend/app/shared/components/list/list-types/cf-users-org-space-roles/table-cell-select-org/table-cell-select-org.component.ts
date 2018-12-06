import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of as observableOf, Subscription } from 'rxjs';

import { IOrganization } from '../../../../../../core/cf-api.types';
import { ActiveRouteCfOrgSpace } from '../../../../../../features/cloud-foundry/cf-page.types';
import { CfRolesService } from '../../../../../../features/cloud-foundry/users/manage-users/cf-roles.service';
import { UsersRolesSetOrg } from '../../../../../../store/actions/users-roles.actions';
import { AppState } from '../../../../../../store/app-state';
import { selectUsersRolesOrgGuid } from '../../../../../../store/selectors/users-roles.selector';
import { APIResource } from '../../../../../../store/types/api.types';
import { TableCellCustom } from '../../../list.types';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-table-cell-select-org',
  templateUrl: './table-cell-select-org.component.html',
  styleUrls: ['./table-cell-select-org.component.scss']
})
export class TableCellSelectOrgComponent extends TableCellCustom<APIResource<IOrganization>> implements OnInit, OnDestroy {

  /**
 * Observable which is populated if only a single org is to be used
 */
  singleOrg$: Observable<APIResource<IOrganization>>;
  organizations$: Observable<APIResource<IOrganization>[]>;
  selectedOrgGuid: string;
  orgGuidChangedSub: Subscription;

  constructor(
    private store: Store<AppState>,
    private activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
    private cfRolesService: CfRolesService,
  ) { super(); }

  ngOnInit() {
    if (this.activeRouteCfOrgSpace.orgGuid) {
      this.singleOrg$ = this.cfRolesService.fetchOrgEntity(this.activeRouteCfOrgSpace.cfGuid, this.activeRouteCfOrgSpace.orgGuid);
    } else {
      this.organizations$ = this.cfRolesService.fetchOrgs(this.activeRouteCfOrgSpace.cfGuid);
      this.singleOrg$ = this.organizations$.pipe(
        // Also count as single org when there's only one org in the list (due to only one org... only one permissable org to edit, etc)
        map(orgs => orgs && orgs.length === 1 ? orgs[0] : null)
      );
    }
    this.orgGuidChangedSub = this.store.select(selectUsersRolesOrgGuid).subscribe(orgGuid => this.selectedOrgGuid = orgGuid);
  }

  ngOnDestroy(): void {
    if (this.orgGuidChangedSub) {
      this.orgGuidChangedSub.unsubscribe();
    }
  }

  updateOrg(orgGuid) {
    if (!orgGuid) {
      return;
    }
    this.store.dispatch(new UsersRolesSetOrg(orgGuid));
  }
}
