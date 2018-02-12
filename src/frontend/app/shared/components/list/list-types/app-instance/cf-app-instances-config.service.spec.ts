import { TestBed, inject } from '@angular/core/testing';

import { CfAppInstancesConfigService } from './cf-app-instances-config.service';
import { endpointStoreNames } from '../../../../../store/types/endpoint.types';
import { generateTestApplicationServiceProvider } from '../../../../../test-framework/application-service-helper';
import { generateTestEntityServiceProvider } from '../../../../../test-framework/entity-service.helper';
import { createBasicStoreModule, getInitialTestStoreState } from '../../../../../test-framework/store-test-helper';
import { SharedModule } from '../../../../shared.module';
import { ApplicationSchema, GetApplication } from '../../../../../store/actions/application.actions';
import { CommonModule } from '@angular/common';
import { CoreModule } from '../../../../../core/core.module';
import { ApplicationsModule } from '../../../../../features/applications/applications.module';
import { RouterTestingModule } from '@angular/router/testing';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';

describe('CfAppInstancesConfigService', () => {

  const initialState = getInitialTestStoreState();
  const cfGuid = Object.keys(initialState.requestData[endpointStoreNames.type])[0];
  const appGuid = Object.keys(initialState.requestData.application)[0];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CfAppInstancesConfigService,
        generateTestEntityServiceProvider(
          appGuid,
          ApplicationSchema,
          new GetApplication(appGuid, cfGuid)
        ),
        generateTestApplicationServiceProvider(appGuid, cfGuid)
      ],
      imports: [
        CommonModule,
        CoreModule,
        SharedModule,
        ApplicationsModule,
        createBasicStoreModule(),
        RouterTestingModule,
      ]
    });
  });

  it('should be created', inject([CfAppInstancesConfigService], (service: CfAppInstancesConfigService) => {
    expect(service).toBeTruthy();
  }));
});
