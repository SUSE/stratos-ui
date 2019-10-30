import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { tag } from 'rxjs-spy/operators/tag';
import { debounceTime, delay, distinctUntilChanged, map, withLatestFrom } from 'rxjs/operators';

import { GetAllApplications } from '../../../../../../../cloud-foundry/src/actions/application.actions';
import { CFAppState } from '../../../../../../../cloud-foundry/src/cf-app-state';
import {
  applicationEntityType,
  appStatsEntityType,
  organizationEntityType,
  routeEntityType,
  spaceEntityType,
} from '../../../../../../../cloud-foundry/src/cf-entity-types';
import { createEntityRelationKey } from '../../../../../../../cloud-foundry/src/entity-relations/entity-relations.types';
import { DispatchSequencer, DispatchSequencerAction } from '../../../../../../../core/src/core/dispatch-sequencer';
import { entityCatalogue } from '../../../../../../../core/src/core/entity-catalogue/entity-catalogue.service';
import {
  distinctPageUntilChanged,
} from '../../../../../../../core/src/shared/components/list/data-sources-controllers/list-data-source';
import {
  ListPaginationMultiFilterChange,
} from '../../../../../../../core/src/shared/components/list/data-sources-controllers/list-data-source-types';
import { IListConfig } from '../../../../../../../core/src/shared/components/list/list.component.types';
import { MultiActionListEntity } from '../../../../../../../core/src/shared/monitors/pagination-monitor';
import { CreatePagination } from '../../../../../../../store/src/actions/pagination.actions';
import { CFListDataSource } from '../../../../../../../store/src/cf-list-data-source';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { PaginationParam } from '../../../../../../../store/src/types/pagination.types';
import { CF_ENDPOINT_TYPE } from '../../../../../../cf-types';
import { cfEntityFactory } from '../../../../../cf-entity-factory';
import { cfOrgSpaceFilter, getRowMetadata } from '../../../../../features/cloud-foundry/cf.helpers';
import { createCfOrSpaceMultipleFilterFn } from '../../../../data-services/cf-org-space-service.service';

// export function createGetAllAppAction(paginationKey): GetAllApplications {
//   return new GetAllApplications(paginationKey, null, [
//     createEntityRelationKey(applicationEntityType, spaceEntityType),
//     createEntityRelationKey(spaceEntityType, organizationEntityType),
//     createEntityRelationKey(applicationEntityType, routeEntityType),
//   ]);
// }

export class CfAppsDataSource extends CFListDataSource<APIResource> {

  public static paginationKey = 'applicationWall';
  public static includeRelations = [
    createEntityRelationKey(applicationEntityType, spaceEntityType),
    createEntityRelationKey(spaceEntityType, organizationEntityType),
    createEntityRelationKey(applicationEntityType, routeEntityType),
  ];
  private subs: Subscription[];
  public action: GetAllApplications;


  constructor(
    store: Store<CFAppState>,
    listConfig?: IListConfig<APIResource>,
    transformEntities?: any[],
    paginationKey = CfAppsDataSource.paginationKey,
    seedPaginationKey = CfAppsDataSource.paginationKey,
    startingCfGuid?: string
  ) {
    const syncNeeded = paginationKey !== seedPaginationKey;
    const action = new GetAllApplications(paginationKey, null, CfAppsDataSource.includeRelations);
    action.endpointGuid = startingCfGuid;

    const dispatchSequencer = new DispatchSequencer(store);

    if (syncNeeded) {
      // We do this here to ensure we sync up with main endpoint table data.
      store.dispatch(new CreatePagination(
        action,
        paginationKey,
        seedPaginationKey
      ));
    }

    if (!transformEntities) {
      transformEntities = [{ type: 'filter', field: 'entity.name' }, cfOrgSpaceFilter];
    }

    super({
      store,
      action,
      schema: cfEntityFactory(applicationEntityType),
      getRowUniqueId: getRowMetadata,
      paginationKey,
      isLocal: true,
      transformEntities,
      listConfig,
      destroy: () => this.subs.forEach(sub => sub.unsubscribe())
    });

    this.action = action;

    const statsSub = this.page$.pipe(
      // The page observable will fire often, here we're only interested in updating the stats on actual page changes
      distinctUntilChanged(distinctPageUntilChanged(this)),
      // Ensure we keep pagination smooth
      debounceTime(250),
      // Allow maxedResults time to settle - see #3359
      delay(100),
      withLatestFrom(this.maxedResults$),
      map(([page, maxedResults]) => {
        if (!page || maxedResults) {
          return [];
        }
        const actions = new Array<DispatchSequencerAction>();
        page.forEach(app => {
          if (app instanceof MultiActionListEntity) {
            app = app.entity;
          }
          const appState = app.entity.state;
          const appGuid = app.metadata.guid;
          const cfGuid = app.entity.cfGuid;
          if (appState === 'STARTED') {
            const appStatsEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appStatsEntityType);
            const actionBuilder = appStatsEntity.actionOrchestrator.getActionBuilder('get');
            const getAction = actionBuilder(appGuid, cfGuid);
            actions.push({
              id: appGuid,
              action: getAction
            });
          }
        });
        return actions;
      }),
      dispatchSequencer.sequence.bind(dispatchSequencer),
      tag('stat-obs')
    ).subscribe();

    this.subs = [statsSub];
  }

  public setMultiFilter(changes: ListPaginationMultiFilterChange[], params: PaginationParam) {
    return createCfOrSpaceMultipleFilterFn(this.store, this.action, this.setQParam)
      (changes, params);
  }

}
