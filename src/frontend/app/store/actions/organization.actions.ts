import { CFStartAction } from '../types/request.types';
import { getAPIResourceGuid } from '../selectors/api.selectors';
import { RequestOptions, URLSearchParams } from '@angular/http';
import { schema } from 'normalizr';

import { ApiActionTypes } from './request.actions';
import { SpaceSchema } from './space.actions';
import { PaginatedAction } from '../types/pagination.types';

export const GET_ALL = '[Organization] Get all';
export const GET_ALL_SUCCESS = '[Organization] Get all success';
export const GET_ALL_FAILED = '[Organization] Get all failed';

export const OrganizationSchema = new schema.Entity('organization', {
  entity: {
    spaces: [SpaceSchema]
  }
}, {
    idAttribute: getAPIResourceGuid
  });

export class GetAllOrganizations extends CFStartAction implements PaginatedAction {
  constructor(public paginationKey: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'organizations';
    this.options.method = 'get';
  }
  actions = [
    GET_ALL,
    GET_ALL_SUCCESS,
    GET_ALL_FAILED
  ];
  entity = [OrganizationSchema];
  entityKey = OrganizationSchema.key;
  options: RequestOptions;
  initialParams = {
    page: 1,
    'results-per-page': 100,
    'inline-relations-depth': 1
  };
}
