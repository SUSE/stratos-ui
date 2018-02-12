import { CFStartAction, IRequestAction, ICFAction } from '../types/request.types';
import { getAPIResourceGuid } from '../selectors/api.selectors';
import { schema } from 'normalizr';
import { ApiActionTypes } from './request.actions';
import { RequestOptions } from '@angular/http';
import { OrganisationSchema } from './organisation.action';

export const GET = '[Space] Get one';
export const GET_SUCCESS = '[Space] Get one success';
export const GET_FAILED = '[Space] Get one failed';

export const SpaceSchema = new schema.Entity('space', {
  entity: {
    organization: OrganisationSchema
  }
}, {
    idAttribute: getAPIResourceGuid
  });

export class GetSpace extends CFStartAction implements ICFAction {
  constructor(public guid: string, public endpointGuid: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = `space/${guid}`;
    this.options.method = 'get';
  }
  actions = [
    GET,
    GET_SUCCESS,
    GET_FAILED
  ];
  entity = [SpaceSchema];
  entityKey = SpaceSchema.key;
  options: RequestOptions;
}
