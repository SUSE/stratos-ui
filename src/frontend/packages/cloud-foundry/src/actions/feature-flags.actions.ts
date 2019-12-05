import { getActions } from '../../../store/src/actions/action.helper';
import { PaginatedAction } from '../../../store/src/types/pagination.types';
import { RequestEntityLocation } from '../../../store/src/types/request.types';
import { cfEntityFactory } from '../cf-entity-factory';
import { featureFlagEntityType } from '../cf-entity-types';
import { CFStartAction } from './cf-action.types';
import { HttpRequest } from '@angular/common/http';

export class GetAllFeatureFlags extends CFStartAction implements PaginatedAction {
  constructor(public endpointGuid: string, public paginationKey: string) {
    super();
    this.options = new HttpRequest(
      'GET',
      `config/feature_flags`
    );
    this.guid = endpointGuid;
  }
  guid: string;
  entityType = featureFlagEntityType;
  entity = [cfEntityFactory(featureFlagEntityType)];
  actions = getActions('Feature Flags', 'Fetch all');
  options: HttpRequest<any>;
  flattenPagination: false;
  entityLocation = RequestEntityLocation.ARRAY;
  initialParams = {
    page: 1,
    'order-direction': 'desc',
    'order-direction-field': 'name',
    'results-per-page': 25,
  };
}
