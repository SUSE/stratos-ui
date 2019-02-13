import { inject, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';

import { CurrentUserPermissionsService } from '../../../../../core/current-user-permissions.service';
import { ActiveRouteCfOrgSpace } from '../../../../../features/cloud-foundry/cf-page.types';
import {
  CloudFoundryOrganizationService,
} from '../../../../../features/cloud-foundry/services/cloud-foundry-organization.service';
import { CloudFoundrySpaceService } from '../../../../../features/cloud-foundry/services/cloud-foundry-space.service';
import { AppState } from '../../../../../store/app-state';
import {
  BaseTestModules,
  generateTestCfEndpointServiceProvider,
} from '../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { CloudFoundryOrganizationServiceMock } from '../../../../../test-framework/cloud-foundry-organization.service.mock';
import { CloudFoundrySpaceServiceMock } from '../../../../../test-framework/cloud-foundry-space.service.mock';
import { CfUserService } from '../../../../data-services/cf-user.service';
import { CfUserListConfigService } from './cf-user-list-config.service';

describe('CfUserListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ...BaseTestModules
      ],
      providers: [
        {
          provide: CfUserListConfigService,
          useFactory: (
            store: Store<AppState>,
            cfUserService: CfUserService,
            router: Router,
            activeRouteCfOrgSpace: ActiveRouteCfOrgSpace,
            userPerms: CurrentUserPermissionsService,
          ) => new CfUserListConfigService(store, cfUserService, router, activeRouteCfOrgSpace, userPerms),
          deps: [Store, CfUserService, Router, ActiveRouteCfOrgSpace, CurrentUserPermissionsService]
        }
        ,
        { provide: CloudFoundrySpaceService, useClass: CloudFoundrySpaceServiceMock },
        { provide: CloudFoundryOrganizationService, useClass: CloudFoundryOrganizationServiceMock },
        ...generateTestCfEndpointServiceProvider()
      ]
    });
  });

  it('should be created', inject([CfUserListConfigService], (service: CfUserListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
