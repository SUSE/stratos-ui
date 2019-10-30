import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpModule } from '@angular/http';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { TabNavService } from '../../../../tab-nav.service';
import { CoreTestingModule } from '../../../../test-framework/core-test.modules';
import { createBasicStoreModule } from '../../../../test-framework/store-test-helper';
import { CoreModule } from '../../../core/core.module';
import { SharedModule } from '../../../shared/shared.module';
import { ConnectEndpointComponent } from '../connect-endpoint/connect-endpoint.component';
import { CreateEndpointCfStep1Component } from './create-endpoint-cf-step-1/create-endpoint-cf-step-1.component';
import { CreateEndpointConnectComponent } from './create-endpoint-connect/create-endpoint-connect.component';
import { CreateEndpointComponent } from './create-endpoint.component';

// TODO: Fix after metrics has been sorted - STRAT-152
xdescribe('CreateEndpointComponent', () => {
  let component: CreateEndpointComponent;
  let fixture: ComponentFixture<CreateEndpointComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CreateEndpointComponent,
        CreateEndpointCfStep1Component,
        CreateEndpointConnectComponent,
        ConnectEndpointComponent
      ],
      imports: [
        CoreModule,
        SharedModule,
        CoreTestingModule,
        createBasicStoreModule(),
        RouterTestingModule,
        NoopAnimationsModule,
        HttpModule
      ],
      providers: [{
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            queryParams: {},
            params: {
              type: 'metrics',
              subtype: null
            }
          }
        }
      }, TabNavService],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEndpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
