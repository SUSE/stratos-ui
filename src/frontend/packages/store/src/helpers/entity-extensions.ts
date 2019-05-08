import { EntitySchema, addEntityToCache } from './entity-factory';
import { defaultCfEntitiesState } from '../types/entity.types';
import { registerAPIRequestEntity } from '../reducers/api-request-reducers.generator';
import { setDefaultPaginationState } from '../reducers/pagination-reducer/pagination.reducer';
import { ExtensionService } from '../../../core/src/core/extension/extension-service';

// Allow extenstions to add entities to the entity cache
export function addExtensionEntities(extensions: ExtensionService) {
  extensions.metadata.entities.forEach(entity => {
    const entitySchema = new EntitySchema(entity.entityKey, entity.definition, entity.options, entity.relationKey);
    addEntityToCache(entitySchema);
    defaultCfEntitiesState[entity.entityKey] = {};
    registerAPIRequestEntity(entity.entityKey);
  });

  setDefaultPaginationState({ ...defaultCfEntitiesState });
}
