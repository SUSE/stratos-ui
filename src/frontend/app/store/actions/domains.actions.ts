import { RequestOptions, URLSearchParams } from '@angular/http';
import { schema } from 'normalizr';

import { getAPIResourceGuid } from '../selectors/api.selectors';
import { PaginatedAction } from '../types/pagination.types';
import { CFStartAction, ICFAction } from '../types/request.types';

export const GET_DOMAIN = '[domain] Get domain ';
export const GET_DOMAIN_SUCCESS = '[domain] Get domain success';
export const GET_DOMAIN_FAILED = '[domain] Get domain failed';

export const DomainSchema = new schema.Entity(
  'domain',
  {},
  {
    idAttribute: getAPIResourceGuid
  }
);

export class FetchDomain extends CFStartAction implements ICFAction {
  cnis: string;
  constructor(public domainGuid: string, public cfGuid: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = `shared_domains/${domainGuid}`;
    this.options.method = 'get';
    this.options.params = new URLSearchParams();
    this.cnis = cfGuid;
  }
  actions = [GET_DOMAIN, GET_DOMAIN_SUCCESS, GET_DOMAIN_FAILED];
  entity = [DomainSchema];
  entityKey = DomainSchema.key;
  options: RequestOptions;
}
export class FetchAllDomains extends CFStartAction implements PaginatedAction {
  cnis: string;
  constructor(public cfGuid: string) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'shared_domains';
    this.options.method = 'get';
    this.options.params = new URLSearchParams();
    this.cnis = cfGuid;
  }
  actions = [GET_DOMAIN, GET_DOMAIN_SUCCESS, GET_DOMAIN_FAILED];
  entity = [DomainSchema];
  entityKey = DomainSchema.key;
  options: RequestOptions;
  paginationKey = 'domain';
}
