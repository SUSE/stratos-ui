import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@ngrx/store';

import { CoreModule } from '../../../../../../../../core/src/core/core.module';
import {
  getPaginationAction,
} from '../../../../../../../../core/src/core/entity-catalogue/action-orchestrator/action-orchestrator.spec.helpers';
import { EntityCatalogueEntityConfig } from '../../../../../../../../core/src/core/entity-catalogue/entity-catalogue.types';
import { MDAppModule } from '../../../../../../../../core/src/core/md.module';
import {
  ApplicationStateService,
} from '../../../../../../../../core/src/shared/components/application-state/application-state.service';
import { SharedModule } from '../../../../../../../../core/src/shared/shared.module';
import { NormalizedResponse } from '../../../../../../../../store/src/types/api.types';
import { PaginatedAction } from '../../../../../../../../store/src/types/pagination.types';
import { WrapperRequestActionSuccess } from '../../../../../../../../store/src/types/request.types';
import { generateCfStoreModules } from '../../../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { cfEntityFactory } from '../../../../../../cf-entity-factory';
import { appEventEntityType } from '../../../../../../cf-entity-types';
import { ApplicationService } from '../../../../application.service';
import { ApplicationEnvVarsHelper } from '../build-tab/application-env-vars.service';
import { EventsTabComponent } from './events-tab.component';



describe('EventsTabComponent', () => {
  class ApplicationServiceMock {
    cfGuid = 'mockCfGuid';
    appGuid = 'mockAppGuid';
  }

  let component: EventsTabComponent;
  let fixture: ComponentFixture<EventsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EventsTabComponent],
      providers: [
        { provide: ApplicationService, useClass: ApplicationServiceMock },
        ApplicationStateService,
        ApplicationEnvVarsHelper,
      ],
      imports: [
        ...generateCfStoreModules(),
        MDAppModule,
        SharedModule,
        CoreModule,
        NoopAnimationsModule,
      ]
    })
      .compileComponents();
    const eventsConfig: EntityCatalogueEntityConfig = cfEntityFactory(appEventEntityType);

    const mappedData = {
      entities: {},
      result: []
    } as NormalizedResponse;
    const pagAction: PaginatedAction = {
      type: 'POPULATE_TEST_DATA',
      ...getPaginationAction(),
      ...eventsConfig,
      paginationKey: 'app-events:mockCfGuidmockAppGuid'
    };
    const store = TestBed.get(Store);
    store.dispatch(new WrapperRequestActionSuccess(mappedData, pagAction, 'fetch'));
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
