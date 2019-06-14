import { RequestOptions, URLSearchParams } from '@angular/http';

import { buildpackEntityType, cfEntityFactory } from '../../../cloud-foundry/src/cf-entity-factory';
import { PaginatedAction } from '../types/pagination.types';
import { CFStartAction } from '../types/request.types';
import { getActions } from './action.helper';

export class FetchAllBuildpacks extends CFStartAction implements PaginatedAction {
  constructor(public endpointGuid: string, public paginationKey: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'buildpacks';
    this.options.method = 'get';
    this.options.params = new URLSearchParams();
  }
  actions = getActions('Buildpacks', 'List all');
  entity = [cfEntityFactory(buildpackEntityType)];
  entityType = buildpackEntityType;
  options: RequestOptions;
  initialParams = {
    page: 1,
    'results-per-page': 100,
    'order-direction': 'desc',
    'order-direction-field': 'position',
  };
  flattenPagination = true;
}
