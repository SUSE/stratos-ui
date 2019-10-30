import { DatePipe } from '@angular/common';
import { inject, TestBed } from '@angular/core/testing';

import { CfQuotasListConfigService } from './cf-quotas-list-config.service';
import {
  generateTestCfEndpointServiceProvider
} from '../../../../../../../cloud-foundry/test-framework/cloud-foundry-endpoint-service.helper';
import { CFBaseTestModules } from '../../../../../../../cloud-foundry/test-framework/cf-test-helper';

describe('CfQuotasListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...generateTestCfEndpointServiceProvider(), CfQuotasListConfigService, DatePipe],
      imports: [
        ...CFBaseTestModules
      ]

    });
  });

  it('should be created', inject([CfQuotasListConfigService], (service: CfQuotasListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
