import { inject, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store, StoreModule } from '@ngrx/store';

import { CoreModule } from '../../../../../core/core.module';
import { ApplicationService } from '../../../../../features/applications/application.service';
import { AppState } from '../../../../../store/app-state';
import { appReducers } from '../../../../../store/reducers.module';
import { ApplicationServiceMock } from '../../../../../test-framework/application-service-helper';
import { getInitialTestStoreState } from '../../../../../test-framework/store-test-helper';
import { SharedModule } from '../../../../shared.module';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { CfAppRoutesListConfigService } from './cf-app-routes-list-config.service';

describe('CfAppRoutesListConfigService', () => {

  const initialState = { ...getInitialTestStoreState() };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ApplicationService, useClass: ApplicationServiceMock },
        {
          provide: CfAppRoutesListConfigService,
          useFactory: (
            store: Store<AppState>,
            appService: ApplicationService,
            confirmDialog: ConfirmationDialogService) => {
            return new CfAppRoutesListConfigService(store, appService, confirmDialog);
          },
          deps: [Store, ApplicationService, ConfirmationDialogService]
        }

      ],
      imports: [
        SharedModule,
        CoreModule,
        StoreModule.forRoot(
          appReducers,
          {
            initialState
          }
        ),
        NoopAnimationsModule,
      ]
    });
  });

  it('should be created', inject([CfAppRoutesListConfigService], (service: CfAppRoutesListConfigService) => {
    expect(service).toBeTruthy();
  }));
});
