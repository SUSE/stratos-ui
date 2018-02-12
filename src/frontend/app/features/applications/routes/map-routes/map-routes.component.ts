import { Component, Input, OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core/src/metadata/lifecycle_hooks';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { filter, tap } from 'rxjs/operators';
/* tslint:disable:max-line-length */
import { CfAppMapRoutesListConfigService } from '../../../../shared/components/list/list-types/app-route/cf-app-map-routes-list-config.service';
/* tslint:enable:max-line-length */

import { CfAppRoutesDataSource } from '../../../../shared/components/list/list-types/app-route/cf-app-routes-data-source';
import { ListConfig } from '../../../../shared/components/list/list.component.types';
import { AppState } from '../../../../store/app-state';
import { APIResource, EntityInfo } from '../../../../store/types/api.types';
import { ApplicationService } from '../../application.service';
import {
  FetchAllDomains,
  DomainSchema
} from '../../../../store/actions/domains.actions';
import { getPaginationObservables } from '../../../../store/reducers/pagination-reducer/pagination-reducer.helper';
import { PaginationMonitorFactory } from '../../../../shared/monitors/pagination-monitor.factory';

@Component({
  selector: 'app-map-routes',
  templateUrl: './map-routes.component.html',
  styleUrls: ['./map-routes.component.scss'],
  providers: [
    {
      provide: ListConfig,
      useClass: CfAppMapRoutesListConfigService
    }
  ]
})
export class MapRoutesComponent implements OnInit, OnDestroy {
  paginationSubscription: any;
  subscription: Subscription;
  @Input() selectedRoute$: BehaviorSubject<APIResource>;

  constructor(
    private store: Store<AppState>,
    private appService: ApplicationService,
    private listConfig: ListConfig<APIResource>,
    private paginationMonitorFactory: PaginationMonitorFactory
  ) {
    this.routesDataSource = listConfig.getDataSource() as CfAppRoutesDataSource;
  }
  routesDataSource: CfAppRoutesDataSource;
  ngOnInit() {
    this.subscription = this.routesDataSource.isSelecting$
      .pipe(
      filter(p => p),
      tap(p => {
        const selectedRow = Array.from(
          this.routesDataSource.selectedRows.values()
        );
        this.selectedRoute$.next(selectedRow[0]);
      })
      )
      .subscribe();

    const action = new FetchAllDomains(this.appService.cfGuid);
    this.paginationSubscription = getPaginationObservables<APIResource>(
      {
        store: this.store,
        action,
        paginationMonitor: this.paginationMonitorFactory.create(
          action.paginationKey,
          DomainSchema
        )
      },
      true
    ).entities$.subscribe();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.paginationSubscription.unsubscribe();
  }
}
