import { AbstractControl, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { CF_ENDPOINT_TYPE, CFEntityConfig } from '../../../../cloud-foundry/cf-types';
import { CFAppState } from '../../../../cloud-foundry/src/cf-app-state';
import {
  organizationEntityType,
  spaceEntityType,
  spaceQuotaEntityType,
} from '../../../../cloud-foundry/src/cf-entity-types';
import { createEntityRelationPaginationKey } from '../../../../cloud-foundry/src/entity-relations/entity-relations.types';
import { ISpaceQuotaDefinition } from '../../../../core/src/core/cf-api.types';
import { entityCatalogue } from '../../../../core/src/core/entity-catalogue/entity-catalogue.service';
import { IEntityMetadata } from '../../../../core/src/core/entity-catalogue/entity-catalogue.types';
import { StepOnNextResult } from '../../../../core/src/shared/components/stepper/step/step.component';
import { PaginationMonitorFactory } from '../../../../core/src/shared/monitors/pagination-monitor.factory';
import { getPaginationKey } from '../../../../store/src/actions/pagination.actions';
import { getPaginationObservables } from '../../../../store/src/reducers/pagination-reducer/pagination-reducer.helper';
import { APIResource } from '../../../../store/src/types/api.types';
import { PaginatedAction } from '../../../../store/src/types/pagination.types';
import { cfEntityFactory } from '../../cf-entity-factory';
import { SpaceQuotaDefinitionActionBuilders } from '../../entity-action-builders/space-quota.action-builders';
import { ActiveRouteCfOrgSpace } from './cf-page.types';

export class AddEditSpaceStepBase {
  fetchSpacesSubscription: Subscription;
  orgGuid: string;
  cfGuid: string;
  allSpacesInOrg: string[];
  allSpacesInOrg$: Observable<string[]>;
  validate: (spaceName: string) => boolean;
  quotaDefinitions$: Observable<APIResource<ISpaceQuotaDefinition>[]>;
  hasSpaceQuotas$: Observable<boolean>;

  constructor(
    protected store: Store<CFAppState>,
    protected activatedRoute: ActivatedRoute,
    protected paginationMonitorFactory: PaginationMonitorFactory,
    protected activeRouteCfOrgSpace: ActiveRouteCfOrgSpace
  ) {
    this.cfGuid = activeRouteCfOrgSpace.cfGuid;
    this.orgGuid = activeRouteCfOrgSpace.orgGuid;
    const paginationKey = getPaginationKey('cf-space', this.orgGuid);
    const spaceEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, spaceEntityType);
    const getAllSpaceActionBuilder = spaceEntity.actionOrchestrator.getActionBuilder('getAllInOrganization');
    const action = getAllSpaceActionBuilder(this.orgGuid, this.cfGuid, paginationKey) as PaginatedAction;

    this.allSpacesInOrg$ = getPaginationObservables<APIResource, CFAppState>(
      {
        store: this.store,
        action,
        paginationMonitor: this.paginationMonitorFactory.create(
          action.paginationKey,
          new CFEntityConfig(spaceEntityType)
        )
      },
      true
    ).entities$.pipe(
      filter(o => !!o),
      map(o => o.map(org => org.entity.name)),
      tap((o) => this.allSpacesInOrg = o)
    );
    this.fetchSpacesSubscription = this.allSpacesInOrg$.subscribe();

    const quotaPaginationKey = createEntityRelationPaginationKey(organizationEntityType, this.orgGuid);

    const quotaEntity = entityCatalogue.getEntity<IEntityMetadata, any, SpaceQuotaDefinitionActionBuilders>(
      CF_ENDPOINT_TYPE,
      spaceQuotaEntityType
    );
    const actionBuilder = quotaEntity.actionOrchestrator.getActionBuilder('getAllInOrganization');
    const getAllInOrganization = actionBuilder(this.orgGuid, this.cfGuid, quotaPaginationKey);
    this.quotaDefinitions$ = getPaginationObservables<APIResource<ISpaceQuotaDefinition>>(
      {
        store: this.store,
        action: getAllInOrganization as PaginatedAction,
        paginationMonitor: this.paginationMonitorFactory.create(
          quotaPaginationKey,
          cfEntityFactory(spaceQuotaEntityType)
        )
      },
      true
    ).entities$.pipe(
      filter(o => !!o),
    );

    this.hasSpaceQuotas$ = this.quotaDefinitions$.pipe(
      map(q => q && q.length > 0)
    );
  }

  destroy(): void {
    this.fetchSpacesSubscription.unsubscribe();
  }

  spaceNameTakenValidator = (): ValidatorFn => {
    return (formField: AbstractControl): { [key: string]: any } => {
      const nameValid = this.validate(formField.value);
      return !nameValid ? { spaceNameTaken: { value: formField.value } } : null;
    };
  }

  protected map(errorMessage: string):
    (source: Observable<{ error: boolean, message: string }>) => Observable<StepOnNextResult> {
    return map(o => ({
      success: !o.error,
      redirect: !o.error,
      message: o.error ? errorMessage + o.message : ''
    }));
  }
}
