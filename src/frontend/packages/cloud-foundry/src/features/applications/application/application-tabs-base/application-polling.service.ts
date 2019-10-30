import { Inject, Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

import { CF_ENDPOINT_TYPE } from '../../../../../../cloud-foundry/cf-types';
import { appStatsEntityType, appSummaryEntityType } from '../../../../../../cloud-foundry/src/cf-entity-types';
import { IApp } from '../../../../../../core/src/core/cf-api.types';
import { entityCatalogue } from '../../../../../../core/src/core/entity-catalogue/entity-catalogue.service';
import { EntityService } from '../../../../../../core/src/core/entity-service';
import { safeUnsubscribe } from '../../../../../../core/src/core/utils.service';
import { ENTITY_SERVICE } from '../../../../../../core/src/shared/entity.tokens';
import { AppState } from '../../../../../../store/src/app-state';
import { selectDashboardState } from '../../../../../../store/src/selectors/dashboard.selectors';
import { APIResource } from '../../../../../../store/src/types/api.types';
import { ApplicationService } from '../../application.service';

@Injectable()
export class ApplicationPollingService {

  private pollingSub: Subscription;
  private autoRefreshString = 'auto-refresh';

  public isPolling$ = this.entityService.updatingSection$.pipe(map(
    update => update[this.autoRefreshString] && update[this.autoRefreshString].busy
  ));

  public isEnabled$: Observable<boolean>;

  constructor(
    public applicationService: ApplicationService,
    @Inject(ENTITY_SERVICE) private entityService: EntityService<APIResource<IApp>>,
    private store: Store<AppState>,
    private ngZone: NgZone,
  ) {
    this.isEnabled$ = this.store.select(selectDashboardState).pipe(
      map(dashboardState => dashboardState.pollingEnabled)
    );

    // Update initial started/stopped state
    this.isEnabled$.pipe(first()).subscribe(enabled => this.updateEnabled(enabled));
  }

  public updateEnabled(enable: boolean) {
    if (enable) {
      this.start();
    } else {
      this.stop();
    }
  }

  public start() {
    if (this.pollingSub && !this.pollingSub.closed) {
      return;
    }

    // Auto refresh
    this.ngZone.runOutsideAngular(() => {
      this.pollingSub = this.entityService
        .poll(10000, this.autoRefreshString).pipe(
          tap(() => this.ngZone.run(() => this.poll(false))))
        .subscribe();
    });
  }

  public stop() {
    safeUnsubscribe(this.pollingSub);
  }

  public poll(withApp = false) {
    const { cfGuid, appGuid } = this.applicationService;
    const actionDispatcher = (action) => this.store.dispatch(action);
    if (withApp) {
      const updatingApp = {
        ...this.entityService.action,
        updatingKey: this.autoRefreshString
      };
      this.store.dispatch(updatingApp);
    }
    this.entityService.entityObs$.pipe(
      first(),
    ).subscribe(resource => {
      const appSummaryEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appSummaryEntityType);
      const appSummaryActionDispatcher = appSummaryEntity.actionOrchestrator.getEntityActionDispatcher(actionDispatcher);
      appSummaryActionDispatcher.dispatchGet(appGuid, cfGuid);
      if (resource && resource.entity && resource.entity.entity && resource.entity.entity.state === 'STARTED') {
        const appStatsEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appStatsEntityType);
        const appStatsActionDispatcher = appStatsEntity.actionOrchestrator.getEntityActionDispatcher(actionDispatcher);
        appStatsActionDispatcher.dispatchGet(appGuid, cfGuid);
      }
    });
  }
}
