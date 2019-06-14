import { DatePipe } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { applicationEntityType, cfEntityFactory } from '../../../../../../cloud-foundry/src/cf-entity-factory';
import { GetApplication } from '../../../../../../store/src/actions/application.actions';
import { generateTestApplicationServiceProvider } from '../../../../../test-framework/application-service-helper';
import { BaseTestModules } from '../../../../../test-framework/cloud-foundry-endpoint-service.helper';
import { generateTestEntityServiceProvider } from '../../../../../test-framework/entity-service.helper';
import {
  ApplicationEnvVarsHelper,
} from '../../application/application-tabs-base/tabs/build-tab/application-env-vars.service';
import { DeleteAppRoutesComponent } from './delete-app-routes.component';

describe('DeleteAppRoutesComponent', () => {
  let component: DeleteAppRoutesComponent;
  let fixture: ComponentFixture<DeleteAppRoutesComponent>;
  const appId = '1';
  const cfId = '2';
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DeleteAppRoutesComponent],
      imports: BaseTestModules,
      providers: [
        generateTestEntityServiceProvider(
          appId,
          cfEntityFactory(applicationEntityType),
          new GetApplication(appId, cfId)
        ),
        generateTestApplicationServiceProvider(cfId, appId),
        ApplicationEnvVarsHelper,
        DatePipe
      ]

    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteAppRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
