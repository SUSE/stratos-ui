import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

import { CF_ENDPOINT_TYPE } from '../../../../../../cloud-foundry/cf-types';
import { organizationEntityType } from '../../../../../../cloud-foundry/src/cf-entity-factory';
import { CreateOrganization } from '../../../../../../store/src/actions/organization.actions';
import { CFAppState } from '../../../../../../store/src/app-state';
import { getPaginationObservables } from '../../../../../../store/src/reducers/pagination-reducer/pagination-reducer.helper';
import { selectRequestInfo } from '../../../../../../store/src/selectors/api.selectors';
import { APIResource } from '../../../../../../store/src/types/api.types';
import { IOrganization } from '../../../../core/cf-api.types';
import { entityCatalogue } from '../../../../core/entity-catalogue/entity-catalogue.service';
import { StepOnNextFunction } from '../../../../shared/components/stepper/step/step.component';
import { PaginationMonitorFactory } from '../../../../shared/monitors/pagination-monitor.factory';
import { CloudFoundryEndpointService } from '../../services/cloud-foundry-endpoint.service';


@Component({
  selector: 'app-create-organization-step',
  templateUrl: './create-organization-step.component.html',
  styleUrls: ['./create-organization-step.component.scss']
})
export class CreateOrganizationStepComponent implements OnInit, OnDestroy {

  orgSubscription: Subscription;
  submitSubscription: Subscription;
  cfGuid: string;
  allOrgs: string[];
  orgs$: Observable<APIResource<IOrganization>[]>;
  cfUrl: string;
  addOrg: FormGroup;

  get orgName(): any { return this.addOrg ? this.addOrg.get('orgName') : { value: '' }; }

  constructor(
    private store: Store<CFAppState>,
    private activatedRoute: ActivatedRoute,
    private paginationMonitorFactory: PaginationMonitorFactory,
  ) {
    this.cfGuid = activatedRoute.snapshot.params.endpointId;
  }

  ngOnInit() {
    this.addOrg = new FormGroup({
      orgName: new FormControl('', [Validators.required as any, this.nameTakenValidator()]),
    });
    const action = CloudFoundryEndpointService.createGetAllOrganizations(this.cfGuid);
    this.orgs$ = getPaginationObservables<APIResource>(
      {
        store: this.store,
        action,
        paginationMonitor: this.paginationMonitorFactory.create(
          action.paginationKey,
          entityCatalogue.getEntity(CF_ENDPOINT_TYPE, organizationEntityType).getSchema()
        )
      },
      true
    ).entities$.pipe(
      filter(o => !!o),
      map(o => o.map(org => org.entity.name)),
      tap((o) => this.allOrgs = o)
    );

    this.orgSubscription = this.orgs$.subscribe();
  }

  nameTakenValidator = (): ValidatorFn => {
    return (formField: AbstractControl): { [key: string]: any } =>
      !this.validateNameTaken(formField.value) ? { nameTaken: { value: formField.value } } : null;
  }

  validateNameTaken = (value: string = null) => this.allOrgs ? this.allOrgs.indexOf(value || this.orgName.value) === -1 : true;

  validate = () => !!this.addOrg && this.addOrg.valid;

  submit: StepOnNextFunction = () => {
    const orgName = this.addOrg.value.orgName;
    this.store.dispatch(new CreateOrganization(orgName, this.cfGuid));

    return this.store.select(selectRequestInfo(organizationEntityType, orgName)).pipe(
      filter(requestInfo => !!requestInfo && !requestInfo.creating),
      map(requestInfo => ({
        success: !requestInfo.error,
        redirect: !requestInfo.error,
        message: requestInfo.error ? `Failed to create organization: ${requestInfo.message}` : ''
      }))
    );
  }

  ngOnDestroy() {
    this.orgSubscription.unsubscribe();
  }
}
