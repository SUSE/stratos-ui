import { TestBed, inject } from '@angular/core/testing';

import { CreateServiceInstanceHelperService } from './create-service-instance-helper.service';
import { BaseTestModules } from '../../../test-framework/cloud-foundry-endpoint-service.helper';

describe('CreateServiceInstanceHelperService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateServiceInstanceHelperService],
      imports: [...BaseTestModules]
    });
  });

  it('should be created', inject([CreateServiceInstanceHelperService], (service: CreateServiceInstanceHelperService) => {
    expect(service).toBeTruthy();
  }));
});
