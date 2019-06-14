import { Store } from '@ngrx/store';

import { cfEntityFactory, organizationEntityType } from '../../../../../../../cloud-foundry/src/cf-entity-factory';
import { CFAppState } from '../../../../../../../store/src/app-state';
import { APIResource } from '../../../../../../../store/src/types/api.types';
import { getRowMetadata } from '../../../../../features/cloud-foundry/cf.helpers';
import { CloudFoundryEndpointService } from '../../../../../features/cloud-foundry/services/cloud-foundry-endpoint.service';
import { ListDataSource } from '../../data-sources-controllers/list-data-source';
import { IListConfig } from '../../list.component.types';

export class CfOrgsDataSourceService extends ListDataSource<APIResource> {

  constructor(store: Store<CFAppState>, cfGuid: string, listConfig?: IListConfig<APIResource>) {
    const action = CloudFoundryEndpointService.createGetAllOrganizations(cfGuid);
    super({
      store,
      action,
      schema: cfEntityFactory(organizationEntityType),
      getRowUniqueId: getRowMetadata,
      paginationKey: action.paginationKey,
      isLocal: true,
      transformEntities: [{ type: 'filter', field: 'entity.name' }],
      listConfig
    });
  }
}
