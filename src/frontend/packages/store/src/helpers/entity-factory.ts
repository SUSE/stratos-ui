import { EntitySchema } from './entity-schema';

export const endpointSchemaKey = 'endpoint';
export const userProfileSchemaKey = 'userProfile';

export const entityCache: {
  [key: string]: EntitySchema
} = {};

// Note - The cache entry is added as a secondary step. This helps keep the child entity definition's clear and easier to spot circular
// dependencies which would otherwise be hidden (if we assigned directly to entityCache and references via entityCache in other entities)

const EndpointSchema = new EntitySchema(endpointSchemaKey, null, {}, { idAttribute: 'guid' });
entityCache[endpointSchemaKey] = EndpointSchema;

const UserProfileInfoSchema = new EntitySchema(userProfileSchemaKey, null, {}, { idAttribute: 'id' });
entityCache[userProfileSchemaKey] = UserProfileInfoSchema;

export function entityFactory(key: string): EntitySchema {
  const entity = entityCache[key];
  if (!entity) {
    throw new Error(`Unknown entity schema type: ${key}`);
  }
  return entity;
}