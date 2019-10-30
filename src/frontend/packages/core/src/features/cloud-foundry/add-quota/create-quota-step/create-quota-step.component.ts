import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map, pairwise } from 'rxjs/operators';

import { CF_ENDPOINT_TYPE } from '../../../../../../cloud-foundry/cf-types';
import {
  QuotaDefinitionActionBuilder,
} from '../../../../../../cloud-foundry/src/entity-action-builders/quota-definition.action-builders';
import { AppState } from '../../../../../../store/src/app-state';
import { entityCatalogue } from '../../../../core/entity-catalogue/entity-catalogue.service';
import { IEntityMetadata } from '../../../../core/entity-catalogue/entity-catalogue.types';
import { StepOnNextFunction } from '../../../../shared/components/stepper/step/step.component';
import { QuotaDefinitionFormComponent } from '../../quota-definition-form/quota-definition-form.component';
import { quotaDefinitionEntityType } from '../../../../../../cloud-foundry/src/cf-entity-types';


@Component({
  selector: 'app-create-quota-step',
  templateUrl: './create-quota-step.component.html',
  styleUrls: ['./create-quota-step.component.scss']
})
export class CreateQuotaStepComponent {

  quotasSubscription: Subscription;
  cfGuid: string;
  quotaForm: FormGroup;

  @ViewChild('form')
  form: QuotaDefinitionFormComponent;

  constructor(
    private store: Store<AppState>,
    private activatedRoute: ActivatedRoute,
  ) {
    this.cfGuid = this.activatedRoute.snapshot.params.endpointId;
  }

  validate = () => !!this.form && this.form.valid();

  submit: StepOnNextFunction = () => {
    const formValues = this.form.formGroup.value;
    const entityConfig =
      entityCatalogue.getEntity<IEntityMetadata, any, QuotaDefinitionActionBuilder>(CF_ENDPOINT_TYPE, quotaDefinitionEntityType);
    entityConfig.actionDispatchManager.dispatchCreate(formValues.name, this.cfGuid, formValues);
    return entityConfig.getEntityMonitor(this.store, formValues.name).entityRequest$.pipe(
      pairwise(),
      filter(([oldV, newV]) => oldV.creating && !newV.creating),
      map(([, newV]) => newV),
      map(requestInfo => ({
        success: !requestInfo.error,
        redirect: !requestInfo.error,
        message: requestInfo.error ? `Failed to create quota: ${requestInfo.message}` : ''
      }))
    );
  }
}
