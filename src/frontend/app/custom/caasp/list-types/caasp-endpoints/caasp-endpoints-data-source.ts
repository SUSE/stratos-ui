import { Store } from '@ngrx/store';

import { ListDataSource } from '../../../../shared/components/list/data-sources-controllers/list-data-source';
import { IListConfig } from '../../../../shared/components/list/list.component.types';
import { GetAllEndpoints } from '../../../../store/actions/endpoint.actions';
import { CreatePagination } from '../../../../store/actions/pagination.actions';
import { AppState } from '../../../../store/app-state';
import { endpointSchemaKey, entityFactory } from '../../../../store/helpers/entity-factory';
import { EndpointModel } from '../../../../store/types/endpoint.types';

function syncPaginationSection(
  store: Store<AppState>,
  action: GetAllEndpoints,
  paginationKey: string
) {
  store.dispatch(new CreatePagination(
    action.entityKey,
    paginationKey,
    action.paginationKey
  ));
}
export class CaaspEndpointsDataSource extends ListDataSource<EndpointModel> {
  store: Store<AppState>;

  constructor(
    store: Store<AppState>,
    listConfig: IListConfig<EndpointModel>
  ) {
    const action = new GetAllEndpoints();
    const paginationKey = 'caasp-endpoints';
    // We do this here to ensure we sync up with main endpoint table data.
    syncPaginationSection(store, action, paginationKey);
    action.paginationKey = paginationKey;
    super({
      store,
      action,
      schema: entityFactory(endpointSchemaKey),
      getRowUniqueId: object => object.guid,
      paginationKey,
      isLocal: true,
      transformEntities: [
        (entities: EndpointModel[]) => {
          return entities.filter(endpoint => endpoint.cnsi_type === 'caasp');
        },
        {
          type: 'filter',
          field: 'name'
        },
      ],
      listConfig
    });
  }
}
