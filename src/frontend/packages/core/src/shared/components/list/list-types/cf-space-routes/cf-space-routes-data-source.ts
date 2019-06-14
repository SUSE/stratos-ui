import { Store } from '@ngrx/store';

import {
  applicationEntityType,
  domainEntityType,
  routeEntityType,
  spaceEntityType,
} from '../../../../../../../cloud-foundry/src/cf-entity-factory';
import { GetSpaceRoutes } from '../../../../../../../store/src/actions/space.actions';
import { CFAppState } from '../../../../../../../store/src/app-state';
import {
  createEntityRelationKey,
  createEntityRelationPaginationKey,
} from '../../../../../../../store/src/helpers/entity-relations/entity-relations.types';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { IRoute } from '../../../../../core/cf-api.types';
import { IListDataSource } from '../../data-sources-controllers/list-data-source-types';
import { IListConfig } from '../../list.component.types';
import { CfRoutesDataSourceBase } from '../cf-routes/cf-routes-data-source-base';


export class CfSpaceRoutesDataSource extends CfRoutesDataSourceBase implements IListDataSource<APIResource<IRoute>> {

  constructor(
    store: Store<CFAppState>,
    listConfig: IListConfig<APIResource>,
    spaceGuid: string,
    cfGuid: string
  ) {
    const paginationKey = createEntityRelationPaginationKey(spaceEntityType, spaceGuid);
    const action = new GetSpaceRoutes(spaceGuid, cfGuid, paginationKey, [
      createEntityRelationKey(routeEntityType, applicationEntityType),
      createEntityRelationKey(routeEntityType, domainEntityType),
    ], true, false);
    action.initialParams['order-direction-field'] = 'creation';
    super(store, listConfig, cfGuid, action, false);
  }

}

