import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseTestModules } from '../../../test-framework/cloud-foundry-endpoint-service.helper';
import { ServicesService } from '../services.service';
import { ServicesServiceMock } from '../services.service.mock';
import { ServiceTabsBaseComponent } from './service-tabs-base.component';

describe('ServiceTabsBaseComponent', () => {
  let component: ServiceTabsBaseComponent;
  let fixture: ComponentFixture<ServiceTabsBaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceTabsBaseComponent],
      imports: [...BaseTestModules],
      providers: [{
        provide: ServicesService, useClass: ServicesServiceMock
      }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceTabsBaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
