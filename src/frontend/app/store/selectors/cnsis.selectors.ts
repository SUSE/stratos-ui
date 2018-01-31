import { register } from 'ts-node/dist';
import { createSelector } from '@ngrx/store';
import { AppState } from '../app-state';
import { CNSISModel, CNSISState, cnsisStoreNames } from '../types/cnsis.types';
import { selectEntities, selectRequestInfo, selectEntity } from './api.selectors';

// The custom status section
export const cnsisStatusSelector = (state: AppState): CNSISState => state.cnsis;

// All CNSI request data
export const cnsisEntitiesSelector = selectEntities<CNSISModel>(cnsisStoreNames.type);
// All Registered  CNSI request data
export const cnsisRegisteredEntitiesSelector = createSelector(
  cnsisEntitiesSelector,
  cnsis => {
    const registered = {};
    Object.values(cnsis).map(cnsi => {
      if (cnsi.registered) {
        registered[cnsi.guid] = cnsi;
      }
      return registered;
    });
    return registered;
  },
);

// Single CNSI request information
export const cnsisEntityRequestSelector = (guid) => selectRequestInfo(cnsisStoreNames.type, guid);
// Single CNSI request data
export const cnsisEntityRequestDataSelector = (guid) => selectEntity(cnsisStoreNames.type, guid);
