import { CommonModule } from '@angular/common';
import { inject, TestBed } from '@angular/core/testing';

import { CoreModule } from '../../../../../core/core.module';
import { ApplicationsModule } from '../../../../../features/applications/applications.module';
import { ApplicationSchema, GetApplication } from '../../../../../store/actions/application.actions';
import { endpointStoreNames } from '../../../../../store/types/endpoint.types';
import { generateTestApplicationServiceProvider } from '../../../../../test-framework/application-service-helper';
import { generateTestEntityServiceProvider } from '../../../../../test-framework/entity-service.helper';
import { createBasicStoreModule, getInitialTestStoreState } from '../../../../../test-framework/store-test-helper';
import { SharedModule } from '../../../../shared.module';
import { CfAppEventsConfigService } from './cf-app-events-config.service';
import { EntityServiceFactory } from '../../../../../core/entity-service-factory.service';



describe('CfAppEventsConfigService', () => {
  const initialState = getInitialTestStoreState();

  const cfGuid = Object.keys(initialState.requestData[endpointStoreNames.type])[0];
  const appGuid = Object.keys(initialState.requestData.application)[0];
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CfAppEventsConfigService,
        EntityServiceFactory,
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
        createBasicStoreModule()
      ]
    });
  });

  it('should be created', inject([CfAppEventsConfigService], (service: CfAppEventsConfigService) => {
    expect(service).toBeTruthy();
  }));
});
