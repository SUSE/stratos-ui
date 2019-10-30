import { Inject, Injectable, Optional } from '@angular/core';
import { Store } from '@ngrx/store';

import { GeneralEntityAppState } from '../../../store/src/app-state';
import { EntityRequestAction } from '../../../store/src/types/request.types';
import { EntityMonitorFactory } from '../shared/monitors/entity-monitor.factory.service';
import { entityCatalogue } from './entity-catalogue/entity-catalogue.service';
import { EntityActionBuilderEntityConfig } from './entity-catalogue/entity-catalogue.types';
import { ENTITY_INFO_HANDLER, EntityInfoHandler, EntityService } from './entity-service';

@Injectable()
export class EntityServiceFactory {
  private isConfig(config: string | EntityActionBuilderEntityConfig) {
    if (config) {
      return !!(config as EntityActionBuilderEntityConfig).entityGuid;
    }
    return false;
  }
  constructor(
    private store: Store<GeneralEntityAppState>,
    private entityMonitorFactory: EntityMonitorFactory,
    @Optional() @Inject(ENTITY_INFO_HANDLER) private entityInfoHandler: EntityInfoHandler
  ) { }

  // FIXME: See #3833. Improve typing of action passed to entity service factory create
  create<T>(
    entityConfig: EntityActionBuilderEntityConfig,
  ): EntityService<T>;
  create<T>(
    entityId: string,
    action: EntityRequestAction
  ): EntityService<T>;
  create<T>(
    // FIXME: Remove entityId and use action.guid (should be accessibly via IRequestAction-->SingleEntityAction) - STRAT-159
    // FIXME: Also we should bump this into the catalogue https://jira.capbristol.com/browse/STRAT-141
    entityIdOrConfig: string | EntityActionBuilderEntityConfig,
    action?: EntityRequestAction
  ): EntityService<T> {
    const config = entityIdOrConfig as EntityActionBuilderEntityConfig;
    const isConfig = this.isConfig(config);

    const entityMonitor = this.entityMonitorFactory.create<T>(
      isConfig ? config.entityGuid : entityIdOrConfig as string,
      isConfig ? config : action
    );
    if (isConfig) {
      // Get the get action from the entity catalogue.
      const actionBuilder = entityCatalogue.getEntity(config.endpointType, config.entityType).actionOrchestrator.getActionBuilder('get');
      return new EntityService<T>(this.store, entityMonitor, actionBuilder(
        config.entityGuid,
        config.endpointGuid,
        config.actionMetadata || {}
      ), this.entityInfoHandler);
    }
    return new EntityService<T>(this.store, entityMonitor, action, this.entityInfoHandler);
  }

}
