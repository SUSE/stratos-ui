import { DatePipe } from '@angular/common';
import { inject, TestBed } from '@angular/core/testing';

import { CfSpaceQuotasListConfigService } from './cf-space-quotas-list-config.service';
import {
  generateTestCfEndpointServiceProvider
} from '../../../../../../../cloud-foundry/test-framework/cloud-foundry-endpoint-service.helper';
import { CFBaseTestModules } from '../../../../../../../cloud-foundry/test-framework/cf-test-helper';

describe('CfSpaceQuotasListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...generateTestCfEndpointServiceProvider(), CfSpaceQuotasListConfigService, DatePipe],
      imports: [
        ...CFBaseTestModules
      ]

    });
  });

  it('should be created', inject([CfSpaceQuotasListConfigService], (service: CfSpaceQuotasListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
