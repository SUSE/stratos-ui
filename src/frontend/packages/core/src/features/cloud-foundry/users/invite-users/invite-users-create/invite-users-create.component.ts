import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { GetOrganization } from '../../../../../../../store/src/actions/organization.actions';
import { ClearPaginationOfType } from '../../../../../../../store/src/actions/pagination.actions';
import { GetSpace } from '../../../../../../../store/src/actions/space.actions';
import { AppState } from '../../../../../../../store/src/app-state';
import {
  cfUserSchemaKey,
  entityFactory,
  organizationSchemaKey,
  spaceSchemaKey,
} from '../../../../../../../store/src/helpers/entity-factory';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { SpaceUserRoleNames } from '../../../../../../../store/src/types/user.types';
import { UserRoleLabels } from '../../../../../../../store/src/types/users-roles.types';
import { IOrganization, ISpace } from '../../../../../core/cf-api.types';
import { EntityServiceFactory } from '../../../../../core/entity-service-factory.service';
import {
  StackedInputActionResult,
} from '../../../../../shared/components/stacked-input-actions/stacked-input-action/stacked-input-action.component';
import {
  StackedInputActionsState,
  StackedInputActionsUpdate,
} from '../../../../../shared/components/stacked-input-actions/stacked-input-actions.component';
import { StepOnNextFunction } from '../../../../../shared/components/stepper/step/step.component';
import { ActiveRouteCfOrgSpace } from '../../../cf-page.types';
import { UserInviteSendSpaceRoles, UserInviteService } from '../../../user-invites/user-invite.service';

@Component({
  selector: 'app-invite-users-create',
  templateUrl: './invite-users-create.component.html',
  styleUrls: ['./invite-users-create.component.scss']
})
export class InviteUsersCreateComponent implements OnInit {

  public valid$: Observable<boolean>;
  public stepValid = new BehaviorSubject<boolean>(false);
  public stateIn = new BehaviorSubject<StackedInputActionsState[]>([]);
  public org$: Observable<APIResource<IOrganization>>;
  public space$: Observable<APIResource<ISpace>>;
  public madeChanges = false;
  public isSpace = false;
  public spaceRole: UserInviteSendSpaceRoles = UserInviteSendSpaceRoles.auditor;
  public spaceRoles: { label: string, value: UserInviteSendSpaceRoles }[] = [];
  private users: StackedInputActionsUpdate;

  constructor(
    private store: Store<AppState>,
    private activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
    private entityServiceFactory: EntityServiceFactory,
    private userInviteService: UserInviteService
  ) {
    this.valid$ = this.stepValid.asObservable();
    this.spaceRoles.push(
      {
        label: UserRoleLabels.space.short[SpaceUserRoleNames.AUDITOR],
        value: UserInviteSendSpaceRoles.auditor,
      }, {
        label: UserRoleLabels.space.short[SpaceUserRoleNames.DEVELOPER],
        value: UserInviteSendSpaceRoles.developer,
      }, {
        label: UserRoleLabels.space.short[SpaceUserRoleNames.MANAGER],
        value: UserInviteSendSpaceRoles.manager,
      });
  }

  stateOut(users: StackedInputActionsUpdate) {
    this.users = users;
    this.stepValid.next(users.valid);
  }

  ngOnInit() {
    this.isSpace = !!this.activeRouteCfOrgSpace.spaceGuid;
    this.org$ = this.entityServiceFactory.create<APIResource<IOrganization>>(
      organizationSchemaKey,
      entityFactory(organizationSchemaKey),
      this.activeRouteCfOrgSpace.orgGuid,
      new GetOrganization(this.activeRouteCfOrgSpace.orgGuid, this.activeRouteCfOrgSpace.cfGuid, [], false)
    ).waitForEntity$.pipe(
      map(entity => entity.entity)
    );
    this.space$ = this.isSpace ? this.entityServiceFactory.create<APIResource<ISpace>>(
      spaceSchemaKey,
      entityFactory(spaceSchemaKey),
      this.activeRouteCfOrgSpace.spaceGuid,
      new GetSpace(this.activeRouteCfOrgSpace.spaceGuid, this.activeRouteCfOrgSpace.cfGuid, [], false)
    ).waitForEntity$.pipe(
      map(entity => entity.entity)
    ) : observableOf(null);
  }

  onNext: StepOnNextFunction = () => {

    // Mark all as processing
    const processingState: StackedInputActionsState[] = [];
    Object.keys(this.users.values).forEach(key => {
      processingState.push({
        key,
        result: StackedInputActionResult.PROCESSING,
      });
    });
    this.stateIn.next(processingState);

    // Kick off the invites
    return this.userInviteService.invite(
      this.activeRouteCfOrgSpace.cfGuid,
      this.activeRouteCfOrgSpace.orgGuid,
      this.activeRouteCfOrgSpace.spaceGuid,
      this.spaceRole,
      Object.values(this.users.values)).pipe(
        map(res => {
          if (!res.error && res.failed_invites.length === 0) {
            // Success! Clear all paginations of type users such that lists can be refetched with new user.s
            this.store.dispatch(new ClearPaginationOfType(cfUserSchemaKey));
          } else if (res.failed_invites.length > 0) {
            // One or more failed. Push failures back into components
            const newState: StackedInputActionsState[] = [];
            Object.entries(this.users.values).forEach(([key, email]) => {
              // Update failed users
              const failed = res.failed_invites.find(invite => invite.email === email);
              if (failed) {
                newState.push({
                  key,
                  result: StackedInputActionResult.FAILED,
                  message: failed.errorMessage
                });
                return;
              }
              // Update succeeded users
              const succeeded = res.new_invites.find(invite => invite.email === email);
              if (succeeded) {
                this.madeChanges = true;
                newState.push({
                  key,
                  result: StackedInputActionResult.SUCCEEDED,
                });
                return;
              }
              // Can't find user for unknown reason, set to failed so it can be tried again
              newState.push({
                key,
                result: StackedInputActionResult.FAILED,
                message: 'No response for user found'
              });
            });
            // We've just come from a valid state, so form should be valid again
            this.stepValid.next(true);
            this.stateIn.next(newState);
            res.errorMessage = 'Failed to invite one or more users. Please address per user message and try again';
          }
          return res;
        }),
        map(res => ({
          success: !res.error,
          message: res.errorMessage,
          redirect: !res.error
        })),
      );
  }

}
