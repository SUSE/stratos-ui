import { RequestOptions, URLSearchParams } from '@angular/http';

import {
  cfEntityFactory,
  organizationEntityType,
  servicePlanEntityType,
  servicePlanVisibilityEntityType,
  spaceEntityType,
} from '../../../cloud-foundry/src/cf-entity-factory';
import { createEntityRelationKey } from '../helpers/entity-relations/entity-relations.types';
import { PaginatedAction } from '../types/pagination.types';
import { CFStartAction } from '../types/request.types';
import { getActions } from './action.helper';

export class GetServicePlanVisibilities extends CFStartAction implements PaginatedAction {
  constructor(
    public endpointGuid: string,
    public paginationKey: string,
    public includeRelations: string[] = [
      createEntityRelationKey(servicePlanVisibilityEntityType, servicePlanEntityType),
      createEntityRelationKey(servicePlanVisibilityEntityType, organizationEntityType),
      createEntityRelationKey(organizationEntityType, spaceEntityType)
    ],
    public populateMissing = true
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'service_plan_visibilities';
    this.options.method = 'get';
    this.options.params = new URLSearchParams();
  }
  actions = getActions('Service Plan Visibilities', 'Get all');
  entity = [cfEntityFactory(servicePlanVisibilityEntityType)];
  entityType = servicePlanVisibilityEntityType;
  options: RequestOptions;
  initialParams = {
    page: 1,
    'results-per-page': 100,
    'order-direction': 'desc',
    'order-direction-field': 'service_plan_guid',
  };
  flattenPagination = true;
}
