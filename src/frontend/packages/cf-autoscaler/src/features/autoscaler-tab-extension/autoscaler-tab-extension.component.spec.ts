import { DatePipe } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { ApplicationService } from '../../../../cloud-foundry/src/features/applications/application.service';
import {
  CardAppInstancesComponent,
} from '../../../../cloud-foundry/src/shared/components/cards/card-app-instances/card-app-instances.component';
import {
  CardAppUsageComponent,
} from '../../../../cloud-foundry/src/shared/components/cards/card-app-usage/card-app-usage.component';
import {
  RunningInstancesComponent,
} from '../../../../cloud-foundry/src/shared/components/running-instances/running-instances.component';
import { CoreModule } from '../../../../core/src/core/core.module';
import { SharedModule } from '../../../../core/src/shared/shared.module';
import { TabNavService } from '../../../../core/tab-nav.service';
import { ApplicationServiceMock } from '../../../../core/test-framework/application-service-helper';
import { createEmptyStoreModule } from '../../../../core/test-framework/store-test-helper';
import { CfAutoscalerTestingModule } from '../../cf-autoscaler-testing.module';
import { CardAutoscalerDefaultComponent } from '../../shared/card-autoscaler-default/card-autoscaler-default.component';
import { AutoscalerTabExtensionComponent } from './autoscaler-tab-extension.component';

describe('AutoscalerTabExtensionComponent', () => {
  let component: AutoscalerTabExtensionComponent;
  let fixture: ComponentFixture<AutoscalerTabExtensionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AutoscalerTabExtensionComponent,
        CardAutoscalerDefaultComponent,
        CardAppInstancesComponent,
        CardAppUsageComponent,
        RunningInstancesComponent
      ],
      imports: [
        CfAutoscalerTestingModule,
        NoopAnimationsModule,
        createEmptyStoreModule(),
        CoreModule,
        SharedModule,
        NgxChartsModule,
        RouterTestingModule,
      ],
      providers: [
        DatePipe,
        { provide: ApplicationService, useClass: ApplicationServiceMock },
        TabNavService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoscalerTabExtensionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => { });
});
