import { Observable, of as observableOf } from 'rxjs';

import { getDefaultRequestState } from '../../store/src/reducers/api-request-reducer/types';
import { APIResource, EntityInfo } from '../../store/src/types/api.types';

// TODO: Move this file to cf package - #3769

export class CloudFoundryOrganizationServiceMock {
  org$: Observable<EntityInfo<APIResource<any>>> = observableOf(
    {
      entity: {
        entity: {
          spaces: [],
          status: ''
        },
        metadata: null
      },
      entityRequestInfo: getDefaultRequestState()
    });
  apps$ = observableOf([]);
  appCount$ = observableOf(0);
  serviceInstancesCount$ = observableOf(0);
  userProvidedServiceInstancesCount$ = observableOf(0);
}
