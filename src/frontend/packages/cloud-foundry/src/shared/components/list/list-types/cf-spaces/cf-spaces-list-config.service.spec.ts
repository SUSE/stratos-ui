import { inject, TestBed } from '@angular/core/testing';

import {
  generateCfBaseTestModules,
  generateTestCfEndpointServiceProvider,
} from '../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { CfOrgsListConfigService } from '../cf-orgs/cf-orgs-list-config.service';

describe('CfOrgsSpaceListConfigService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...generateTestCfEndpointServiceProvider(), CfOrgsListConfigService],
      imports: generateCfBaseTestModules()

    });
  });

  it('should be created', inject([CfOrgsListConfigService], (service: CfOrgsListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
