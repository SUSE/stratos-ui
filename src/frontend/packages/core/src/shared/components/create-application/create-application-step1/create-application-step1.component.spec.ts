import { CommonModule } from '@angular/common';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { StoreModule } from '@ngrx/store';

import { appReducers } from '../../../../../../store/src/reducers.module';
import { getInitialTestStoreState } from '../../../../../test-framework/store-test-helper';
import { CoreModule } from '../../../../core/core.module';
import { CfOrgSpaceDataService } from '../../../data-services/cf-org-space-service.service';
import { PaginationMonitorFactory } from '../../../monitors/pagination-monitor.factory';
import { FocusDirective } from '../../focus.directive';
import { CreateApplicationStep1Component } from './create-application-step1.component';

describe('CreateApplicationStep1Component', () => {
  let component: CreateApplicationStep1Component;
  let fixture: ComponentFixture<CreateApplicationStep1Component>;

  const initialState = { ...getInitialTestStoreState() };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateApplicationStep1Component, FocusDirective],
      imports: [
        CommonModule,
        CoreModule,
        BrowserAnimationsModule,
        StoreModule.forRoot(
          appReducers,
          {
            initialState
          }
        )
      ],
      providers: [CfOrgSpaceDataService, PaginationMonitorFactory, {
        provide: ActivatedRoute,
        useValue: {
          root: {
            snapshot: {
              queryParams: { endpointGuid: null },
            }
          }
        }
      }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateApplicationStep1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
