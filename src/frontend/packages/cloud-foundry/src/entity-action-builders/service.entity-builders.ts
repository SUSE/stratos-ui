import { OrchestratedActionBuilders } from '../../../core/src/core/entity-catalogue/action-orchestrator/action-orchestrator';
import { GetAllServices, GetService } from '../actions/service.actions';
import { GetAllServicesForSpace } from '../actions/space.actions';
import { CFBasePipelineRequestActionMeta } from '../cf-entity-generator';

export const serviceActionBuilders = {
  get: (
    guid,
    endpointGuid,
    { includeRelations, populateMissing }: CFBasePipelineRequestActionMeta = {}
  ) => new GetService(
    guid,
    endpointGuid,
    includeRelations,
    populateMissing
  ),
  getMultiple: (
    endpointGuid,
    paginationKey,
    { includeRelations, populateMissing }: CFBasePipelineRequestActionMeta = {}
  ) => new GetAllServices(paginationKey, endpointGuid, includeRelations, populateMissing),
  getAllInSpace: (
    endpointGuid: string,
    paginationKey: string,
    spaceGuid: string,
    includeRelations?: string[],
    populateMissing?: boolean,
  ) => new GetAllServicesForSpace(paginationKey, endpointGuid, spaceGuid, includeRelations, populateMissing)
} as OrchestratedActionBuilders;
