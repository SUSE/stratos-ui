import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityServiceFactory } from '../../../../../../../../core/src/core/entity-service-factory.service';
import {
  ServiceInstanceLastOpComponent,
} from '../../../../../../../../core/src/shared/components/service-instance-last-op/service-instance-last-op.component';
import { EntityMonitorFactory } from '../../../../../../../../core/src/shared/monitors/entity-monitor.factory.service';
import { PaginationMonitorFactory } from '../../../../../../../../core/src/shared/monitors/pagination-monitor.factory';
import { generateCfBaseTestModules } from '../../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { ServicesWallService } from '../../../../../../features/services/services/services-wall.service';
import { ServiceActionHelperService } from '../../../../../data-services/service-action-helper.service';
import { CfOrgSpaceLinksComponent } from '../../../../cf-org-space-links/cf-org-space-links.component';
import { ServiceInstanceCardComponent } from './service-instance-card.component';

describe('ServiceInstanceCardComponent', () => {
  let component: ServiceInstanceCardComponent;
  let fixture: ComponentFixture<ServiceInstanceCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ServiceInstanceCardComponent, CfOrgSpaceLinksComponent, ServiceInstanceLastOpComponent],
      imports: generateCfBaseTestModules(),
      providers: [
        ServicesWallService,
        EntityServiceFactory,
        EntityMonitorFactory,
        PaginationMonitorFactory,
        ServiceActionHelperService,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceInstanceCardComponent);
    component = fixture.componentInstance;
    component.row = {
      entity: {
        service_plan_guid: 'test',
        space_guid: '',
        space: {
          entity: {
            name: '',
            organization_guid: '',
            allow_ssh: false,
            organization_url: '',
            developers_url: '',
            managers_url: '',
            auditors_url: '',
            apps_url: '',
            routes_url: '',
            domains_url: '',
            service_instances_url: '',
            app_events_url: '',
            security_groups_url: '',
            staging_security_groups_url: '',
          },
          metadata: {
            created_at: '',
            guid: '',
            updated_at: '',
            url: ''
          }
        },
        dashboard_url: '',
        type: '',
        tags: [],
        service_guid: '',
        service_plan_url: '',
        service_bindings: [],
        service_bindings_url: '',
        service_keys_url: '',
        last_operation: {
          type: '',
          state: '',
          description: '',
          updated_at: '',
          created_at: ''
        },
        service: {
          entity: {
            label: '',
            description: '',
            active: 1,
            bindable: 1,
            unique_id: '',
            extra: '',
            tags: [''],
            requires: [''],
            service_broker_guid: '',
            plan_updateable: 1,
            service_plans_url: '',
            service_plans: [],
          },
          metadata: null
        },
        service_plan: {
          entity: {
            name: '',
            free: true,
            description: '',
            service_guid: '',
            extra: '',
            unique_id: '',
            public: false,
            bindable: 0,
            active: false,
            service_url: '',
            service: {
              entity: {
                label: '',
                description: '',
                active: 1,
                bindable: 1,
                unique_id: '',
                extra: '',
                tags: [''],
                requires: [''],
                service_broker_guid: '',
                plan_updateable: 1,
                service_plans_url: '',
                service_plans: [],
              },
              metadata: null
            },
            service_instances_url: '',
          },
          metadata: {
            created_at: '',
            guid: '',
            updated_at: '',
            url: ''
          }
        },
        routes_url: '',
        service_url: ''
      },
      metadata: {
        created_at: '',
        guid: '',
        updated_at: '',
        url: ''
      }
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
