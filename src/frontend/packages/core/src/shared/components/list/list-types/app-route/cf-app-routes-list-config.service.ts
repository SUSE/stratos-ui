import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import {
  CfAppRoutesListConfigServiceBase
} from './cf-app-routes-list-config-base';
import { RouterNav } from '../../../../../../../store/src/actions/router.actions';
import { AppState } from '../../../../../../../store/src/app-state';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { CurrentUserPermissionsService } from '../../../../../core/current-user-permissions.service';
import { ApplicationService } from '../../../../../features/applications/application.service';
import { ConfirmationDialogService } from '../../../confirmation-dialog.service';
import { IGlobalListAction, IListConfig } from '../../list.component.types';


@Injectable()
export class CfAppRoutesListConfigService extends CfAppRoutesListConfigServiceBase implements IListConfig<APIResource> {


  constructor(
    store: Store<AppState>,
    appService: ApplicationService,
    confirmDialog: ConfirmationDialogService,
    datePipe: DatePipe,
    currentUserPermissionsService: CurrentUserPermissionsService,
  ) {
    super(store, appService, confirmDialog, datePipe, currentUserPermissionsService, null, true);

    this.setupList(store, appService);
  }

  private setupList(store: Store<AppState>, appService: ApplicationService) {
    const listActionAddRoute: IGlobalListAction<APIResource> = {
      action: () => {
        appService.application$.pipe(
          take(1),
        ).subscribe(app => {
          store.dispatch(new RouterNav({
            path: [
              'applications',
              appService.cfGuid,
              appService.appGuid,
              'add-route'
            ],
            query: {
              spaceGuid: app.app.entity.space_guid
            }
          }));
        });
      },
      icon: 'add',
      label: 'Add',
      description: 'Add new route'
    };
    this.getGlobalActions = () => [listActionAddRoute];
  }
}
