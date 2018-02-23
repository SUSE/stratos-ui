import { RequestOptions, URLSearchParams } from '@angular/http';
import { Action } from '@ngrx/store';

import { EntityInfo } from '../types/api.types';
import { PaginatedAction } from '../types/pagination.types';
import { CFStartAction, ICFAction } from '../types/request.types';
import { RouteSchema } from './action-types';
import { getPaginationKey } from './pagination.actions';
import { EntityInlineParentAction, EntityInlineChildAction } from '../helpers/entity-relations.helpers';

export const CREATE_ROUTE = '[Route] Create start';
export const CREATE_ROUTE_SUCCESS = '[Route] Create success';
export const CREATE_ROUTE_ERROR = '[Route] Create error';

export const MAP_ROUTE_SELECTED = '[Map Route] Selected route';
export const RouteEvents = {
  GET_SPACE_ALL: '[Space Routes] Get all',
  GET_SPACE_ALL_SUCCESS: '[Space Routes] Get all success',
  GET_SPACE_ALL_FAILED: '[Space Routes] Get all failed',
  DELETE: '[Application Routes] Delete',
  DELETE_SUCCESS: '[Application Routes] Delete success',
  DELETE_FAILED: '[Application Routes] Delete failed',
  UNMAP_ROUTE: '[Application Routes] Unmap route',
  UNMAP_ROUTE_SUCCESS: '[Application Routes] Unmap route success',
  UNMAP_ROUTE_FAILED: '[Application Routes] Unmap route failed'
};

export interface NewRoute {
  domain_guid: string;
  space_guid: string;
  host?: string;
}

export class CreateRoute extends CFStartAction implements ICFAction {
  constructor(public guid: string, public cfGuid: string, route: NewRoute) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'routes';
    this.options.method = 'post';
    this.options.body = {
      generate_port: true,
      ...route
    };
    this.endpointGuid = cfGuid;
  }
  actions = [CREATE_ROUTE, CREATE_ROUTE_SUCCESS, CREATE_ROUTE_ERROR];
  entity = [RouteSchema];
  entityKey = RouteSchema.key;
  options: RequestOptions;
  endpointGuid: string;
}

export class DeleteRoute extends CFStartAction implements ICFAction {
  constructor(
    public guid: string,
    public cfGuid: string,
    public async: boolean = false,
    public recursive: boolean = true
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `routes/${guid}`;
    this.options.method = 'delete';
    this.options.params = new URLSearchParams();
    this.options.params.append('recursive', recursive ? 'true' : 'false');
    this.options.params.append('async', async ? 'true' : 'false');
    this.endpointGuid = cfGuid;
  }
  actions = [
    RouteEvents.DELETE,
    RouteEvents.DELETE_SUCCESS,
    RouteEvents.DELETE_FAILED
  ];
  entity = [RouteSchema];
  entityKey = RouteSchema.key;
  options: RequestOptions;
  endpointGuid: string;
  removeEntityOnDelete = true;
}

export class UnmapRoute extends CFStartAction implements ICFAction {
  constructor(
    public routeGuid: string,
    public appGuid: string,
    public cfGuid: string
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `routes/${routeGuid}/apps/${appGuid}`;
    this.options.method = 'delete';
    this.options.params = new URLSearchParams();
    this.endpointGuid = cfGuid;
  }
  actions = [
    RouteEvents.UNMAP_ROUTE,
    RouteEvents.UNMAP_ROUTE_SUCCESS,
    RouteEvents.UNMAP_ROUTE_FAILED
  ];
  entity = [RouteSchema];
  entityKey = RouteSchema.key;
  options: RequestOptions;
  endpointGuid: string;
}

export class CheckRouteExists extends CFStartAction implements ICFAction {
  constructor(public guid: string, public cfGuid: string, route: NewRoute) {
    super();
    this.options = new RequestOptions();
    this.options.url = 'routes';
    this.options.method = 'post';
    this.options.body = {
      generate_port: true,
      ...route
    };
    this.endpointGuid = cfGuid;
  }
  actions = [CREATE_ROUTE, CREATE_ROUTE_SUCCESS, CREATE_ROUTE_ERROR];
  entity = [RouteSchema];
  entityKey = RouteSchema.key;
  options: RequestOptions;
  endpointGuid: string;
}

export class MapRouteSelected implements Action {
  constructor(routeEntity: EntityInfo) { }
  type = MAP_ROUTE_SELECTED;
}
