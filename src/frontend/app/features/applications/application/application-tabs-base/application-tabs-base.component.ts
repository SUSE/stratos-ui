
import { Component, OnDestroy, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription, combineLatest as observableCombineLatest, of as observableOf } from 'rxjs';
import { delay, filter, first, map, mergeMap, tap, withLatestFrom } from 'rxjs/operators';
import { IApp, IOrganization, ISpace } from '../../../../core/cf-api.types';
import { EntityService } from '../../../../core/entity-service';
import { ConfirmationDialogConfig } from '../../../../shared/components/confirmation-dialog.config';
import { ConfirmationDialogService } from '../../../../shared/components/confirmation-dialog.service';
import { IHeaderBreadcrumb } from '../../../../shared/components/page-header/page-header.types';
import { ISubHeaderTabs } from '../../../../shared/components/page-subheader/page-subheader.types';
import { AppMetadataTypes, GetAppStatsAction, GetAppSummaryAction } from '../../../../store/actions/app-metadata.actions';
import { ResetPagination } from '../../../../store/actions/pagination.actions';
import { RouterNav } from '../../../../store/actions/router.actions';
import { AppState } from '../../../../store/app-state';
import { appStatsSchemaKey, entityFactory, applicationSchemaKey } from '../../../../store/helpers/entity-factory';
import { endpointEntitiesSelector } from '../../../../store/selectors/endpoint.selectors';
import { APIResource } from '../../../../store/types/api.types';
import { EndpointModel } from '../../../../store/types/endpoint.types';
import { ApplicationService } from '../../application.service';
import { EndpointsService } from './../../../../core/endpoints.service';
import { ENTITY_SERVICE } from '../../../../shared/entity.tokens';


// Confirmation dialogs
const appStopConfirmation = new ConfirmationDialogConfig(
  'Stop Application',
  'Are you sure you want to stop this Application?',
  'Stop'
);
const appStartConfirmation = new ConfirmationDialogConfig(
  'Start Application',
  'Are you sure you want to start this Application?',
  'Start'
);
const appRestartConfirmation = new ConfirmationDialogConfig(
  'Restart Application',
  'Are you sure you want to restart this Application?',
  'Restart'
);
// App delete will have a richer delete experience
const appDeleteConfirmation = new ConfirmationDialogConfig(
  'Delete Application',
  'Are you sure you want to delete this Application?',
  'Delete',
  true
);

@Component({
  selector: 'app-application-tabs-base',
  templateUrl: './application-tabs-base.component.html',
  styleUrls: ['./application-tabs-base.component.scss']
})
export class ApplicationTabsBaseComponent implements OnInit, OnDestroy {
  public schema = entityFactory(applicationSchemaKey);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public applicationService: ApplicationService,
    @Inject(ENTITY_SERVICE) private entityService: EntityService<APIResource>,
    private store: Store<AppState>,
    private confirmDialog: ConfirmationDialogService,
    private endpointsService: EndpointsService
  ) {
    const endpoints$ = store.select(endpointEntitiesSelector);
    this.breadcrumbs$ = applicationService.waitForAppEntity$.pipe(
      withLatestFrom(
        endpoints$,
        applicationService.appOrg$,
        applicationService.appSpace$
      ),
      map(([app, endpoints, org, space]) => {
        return this.getBreadcrumbs(
          app.entity.entity,
          endpoints[app.entity.entity.cfGuid],
          org,
          space
        );
      }),
      first()
    );
    this.applicationService.applicationStratProject$
      .pipe(first())
      .subscribe(stratProject => {
        if (
          stratProject &&
          stratProject.deploySource &&
          stratProject.deploySource.type === 'github'
        ) {
          this.tabLinks.push({ link: 'github', label: 'GitHub' });
        }
      });
    this.endpointsService.hasMetrics(applicationService.cfGuid).subscribe(hasMetrics => {
      if (hasMetrics) {
        this.tabLinks.push({
          link: 'metrics',
          label: 'Metrics'
        });
      }
    });
  }
  public breadcrumbs$: Observable<IHeaderBreadcrumb[]>;
  isFetching$: Observable<boolean>;
  applicationActions$: Observable<string[]>;
  summaryDataChanging$: Observable<boolean>;
  appSub$: Subscription;
  entityServiceAppRefresh$: Subscription;
  autoRefreshString = 'auto-refresh';
  appActions$: Observable<{ [key: string]: boolean }>;

  autoRefreshing$ = this.entityService.updatingSection$.pipe(map(
    update => update[this.autoRefreshString] || { busy: false }
  ));

  tabLinks: ISubHeaderTabs[] = [
    { link: 'summary', label: 'Summary' },
    { link: 'instances', label: 'Instances' },
    { link: 'routes', label: 'Routes' },
    { link: 'log-stream', label: 'Log Stream' },
    { link: 'services', label: 'Services' },
    { link: 'variables', label: 'Variables' },
    { link: 'events', label: 'Events' }
  ];

  private getBreadcrumbs(
    application: IApp,
    endpoint: EndpointModel,
    org: APIResource<IOrganization>,
    space: APIResource<ISpace>
  ) {
    const baseCFUrl = `/cloud-foundry/${application.cfGuid}`;
    const baseOrgUrl = `${baseCFUrl}/organizations/${org.metadata.guid}`;

    const baseSpaceBreadcrumbs = [
      { value: endpoint.name, routerLink: `${baseCFUrl}/organizations` },
      { value: org.entity.name, routerLink: `${baseOrgUrl}/spaces` }
    ];

    return [
      {
        breadcrumbs: [{ value: 'Applications', routerLink: '/applications' }]
      },
      {
        key: 'space',
        breadcrumbs: [
          ...baseSpaceBreadcrumbs,
          { value: space.entity.name, routerLink: `${baseOrgUrl}/spaces/${space.metadata.guid}/apps` }
        ]
      },
      {
        key: 'space-services',
        breadcrumbs: [
          ...baseSpaceBreadcrumbs,
          { value: space.entity.name, routerLink: `${baseOrgUrl}/spaces/${space.metadata.guid}/service-instances` }
        ]
      },
      {
        key: 'marketplace-services',
        breadcrumbs: [
          { value: 'Marketplace', routerLink: `/marketplace` }
        ]
      },
      {
        key: 'service-wall',
        breadcrumbs: [
          { value: 'Services', routerLink: `/services` }
        ]
      },
      {
        key: 'space-summary',
        breadcrumbs: [
          ...baseSpaceBreadcrumbs,
          { value: space.entity.name, routerLink: `${baseOrgUrl}/spaces/${space.metadata.guid}/summary` }
        ]
      },
      {
        key: 'org',
        breadcrumbs: [
          { value: endpoint.name, routerLink: `${baseCFUrl}/organizations` },
          { value: org.entity.name, routerLink: `${baseOrgUrl}/summary` },
        ]
      },
      {
        key: 'cf',
        breadcrumbs: [
          { value: endpoint.name, routerLink: `${baseCFUrl}/summary` }
        ]
      }
    ];
  }

  private startStopApp(confirmConfig: ConfirmationDialogConfig, updateKey: string, requiredAppState: string, onSuccess: () => void) {
    this.applicationService.application$.pipe(
      first(),
      tap(appData => {
        this.confirmDialog.open(confirmConfig, () => {
          // Once the state changes always make a request to app stats via [AppMetadataTypes.STATS] below
          this.applicationService.updateApplication({ state: requiredAppState }, [AppMetadataTypes.STATS], appData.app.entity);
          this.pollEntityService(updateKey, requiredAppState).pipe(
            first(),
          ).subscribe(onSuccess);
        });
      })
    ).subscribe();
  }

  stopApplication() {
    this.startStopApp(appStopConfirmation, 'stopping', 'STOPPED', () => {
      // On app reaching the 'STOPPED' state clear the app's stats pagination section
      const { cfGuid, appGuid } = this.applicationService;
      this.store.dispatch(new ResetPagination(appStatsSchemaKey, new GetAppStatsAction(appGuid, cfGuid).paginationKey));
    });
  }

  pollEntityService(state, stateString): Observable<any> {
    return this.entityService
      .poll(1000, state).pipe(
        delay(1),
        filter(({ resource, updatingSection }) => {
          return resource.entity.state === stateString;
        }),
    );
  }

  startApplication() {
    this.startStopApp(appStartConfirmation, 'starting', 'STARTED', () => { });
  }

  private dispatchAppStats = () => {
    const { cfGuid, appGuid } = this.applicationService;
    this.store.dispatch(new GetAppStatsAction(appGuid, cfGuid));
  }

  restartApplication() {
    this.confirmDialog.open(appRestartConfirmation, () => {

      this.applicationService.application$.pipe(
        first(),
        mergeMap(appData => {
          this.applicationService.updateApplication({ state: 'STOPPED' }, [], appData.app.entity);
          return observableCombineLatest(
            observableOf(appData),
            this.pollEntityService('stopping', 'STOPPED').pipe(first())
          );
        }),
        mergeMap(([appData, updateData]) => {
          this.applicationService.updateApplication({ state: 'STARTED' }, [], appData.app.entity);
          return this.pollEntityService('starting', 'STARTED').pipe(first());
        }),
      ).subscribe(null, this.dispatchAppStats, this.dispatchAppStats);

    });
  }

  redirectToDeletePage() {
    this.router.navigate(['./delete'], { relativeTo: this.route });
  }

  ngOnInit() {
    const { cfGuid, appGuid } = this.applicationService;
    // Auto refresh
    this.entityServiceAppRefresh$ = this.entityService
      .poll(10000, this.autoRefreshString).pipe(
        tap(({ resource }) => {
          this.store.dispatch(new GetAppSummaryAction(appGuid, cfGuid));
          if (resource && resource.entity && resource.entity.state === 'STARTED') {
            this.store.dispatch(new GetAppStatsAction(appGuid, cfGuid));
          }
        }))
      .subscribe();

    this.appSub$ = this.entityService.entityMonitor.entityRequest$.subscribe(requestInfo => {
      if (
        requestInfo.deleting.deleted ||
        requestInfo.error
      ) {
        this.store.dispatch(new RouterNav({ path: ['applications'] }));
      }
    });

    this.isFetching$ = this.applicationService.isFetchingApp$;

    const initialFetch$ = observableCombineLatest(
      this.applicationService.isFetchingApp$,
      this.applicationService.isFetchingEnvVars$,
      this.applicationService.isFetchingStats$
    ).pipe(
      map(([isFetchingApp, isFetchingEnvVars, isFetchingStats]) => {
        return isFetchingApp || isFetchingEnvVars || isFetchingStats;
      }));

    this.summaryDataChanging$ = observableCombineLatest(
      initialFetch$,
      this.applicationService.isUpdatingApp$,
      this.autoRefreshing$
    ).pipe(map(([isFetchingApp, isUpdating, autoRefresh]) => {
      if (autoRefresh.busy) {
        return false;
      }
      return !!(isFetchingApp || isUpdating);
    }));

    this.appActions$ = this.applicationService.applicationState$.pipe(
      map(app => app.actions)
    );
  }

  ngOnDestroy() {
    this.appSub$.unsubscribe();
    this.entityServiceAppRefresh$.unsubscribe();
  }
}
