import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

import { CoreModule } from '../../../../../core/src/core/core.module';
import { EntityMonitorFactory } from '../../../../../core/src/shared/monitors/entity-monitor.factory.service';
import { InternalEventMonitorFactory } from '../../../../../core/src/shared/monitors/internal-event-monitor.factory';
import { PaginationMonitorFactory } from '../../../../../core/src/shared/monitors/pagination-monitor.factory';
import { SharedModule } from '../../../../../core/src/shared/shared.module';
import { TabNavService } from '../../../../../core/tab-nav.service';
import { generateCfStoreModules } from '../../../../test-framework/cloud-foundry-endpoint-service.helper';
import {
  CreateApplicationStep1Component,
} from '../../../shared/components/create-application/create-application-step1/create-application-step1.component';
import { CloudFoundryService } from '../../../shared/data-services/cloud-foundry.service';
import { CreateApplicationStep2Component } from './create-application-step2/create-application-step2.component';
import { CreateApplicationStep3Component } from './create-application-step3/create-application-step3.component';
import { CreateApplicationComponent } from './create-application.component';

describe('CreateApplicationComponent', () => {
  let component: CreateApplicationComponent;
  let fixture: ComponentFixture<CreateApplicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreateApplicationComponent,
        CreateApplicationStep1Component,
        CreateApplicationStep2Component,
        CreateApplicationStep3Component
      ],
      imports: [
        ...generateCfStoreModules(),
        CommonModule,
        CoreModule,
        HttpModule,
        RouterTestingModule,
        NoopAnimationsModule,
        SharedModule,
        HttpClientModule,
        HttpClientTestingModule,
      ],
      providers: [
        PaginationMonitorFactory,
        EntityMonitorFactory,
        InternalEventMonitorFactory,
        CloudFoundryService,
        TabNavService
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateApplicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  afterAll(() => { });
});
