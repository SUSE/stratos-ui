import { RequestAction } from '../types/request.types';
import { RequestOptions } from '@angular/http';
import { Schema, schema } from 'normalizr';
import { Action, createSelector } from '@ngrx/store';

import { AppState } from '../app-state';
import { PaginatedAction } from '../types/pagination.types';

export const GET_ENDPOINTS = '[Endpoints] Get all';
export const GET_ENDPOINTS_START = '[Endpoints] Get all start';
export const GET_ENDPOINTS_LOGIN = '[Endpoints] Get all at login';
export const GET_ENDPOINTS_SUCCESS = '[Endpoints] Get all success';
export const GET_ENDPOINTS_FAILED = '[Endpoints] Get all failed';

export const CONNECT_ENDPOINTS = '[Endpoints] Connect';
export const CONNECT_ENDPOINTS_SUCCESS = '[Endpoints] Connect succeed';
export const CONNECT_ENDPOINTS_FAILED = '[Endpoints] Connect failed';

export const DISCONNECT_ENDPOINTS = '[Endpoints] Disconnect';
export const DISCONNECT_ENDPOINTS_SUCCESS = '[Endpoints] Disconnect succeed';
export const DISCONNECT_ENDPOINTS_FAILED = '[Endpoints] Disconnect failed';

export const REGISTER_ENDPOINTS = '[Endpoints] Register';
export const REGISTER_ENDPOINTS_SUCCESS = '[Endpoints] Register succeed';
export const REGISTER_ENDPOINTS_FAILED = '[Endpoints] Register failed';

export const UNREGISTER_ENDPOINTS = '[Endpoints] Unregister';
export const UNREGISTER_ENDPOINTS_SUCCESS = '[Endpoints] Unregister succeed';
export const UNREGISTER_ENDPOINTS_FAILED = '[Endpoints] Unregister failed';

export const EndpointSchema = new schema.Entity('endpoint', {}, {
  idAttribute: 'guid'
});

export class GetAllEndpoints implements PaginatedAction {
  public static storeKey = 'endpoint-list';
  constructor(public login = false) { }
  entityKey = EndpointSchema.key;
  paginationKey = GetAllEndpoints.storeKey;
  type = GET_ENDPOINTS;
  actions = [
    GET_ENDPOINTS_START,
    GET_ENDPOINTS_SUCCESS,
    GET_ENDPOINTS_SUCCESS
  ];
  initialParams = {
    'order-direction': 'desc',
    'order-direction-field': 'name',
    page: 1,
    'results-per-page': 50,
  };
}

export class GetAllEndpointsSuccess implements Action {
  constructor(public payload: {}, public login = false) { }
  type = GET_ENDPOINTS_SUCCESS;
}

export class GetAllEndpointsFailed implements Action {
  constructor(public message: string, public login = false) { }
  type = GET_ENDPOINTS_FAILED;
}

export class ConnectEndpoint implements Action {
  constructor(
    public guid: string,
    public username: string,
    public password: string,
  ) { }
  type = CONNECT_ENDPOINTS;
}

export class DisconnectEndpoint implements Action {
  constructor(
    public guid: string
  ) { }
  type = DISCONNECT_ENDPOINTS;
}

export class UnregisterEndpoint implements Action {
  constructor(
    public guid: string
  ) { }
  type = UNREGISTER_ENDPOINTS;
}

export class RegisterEndpoint implements Action {
  constructor(
    public name: string,
    public endpoint: string,
    public skipSslValidation: boolean,
  ) { }
  type = REGISTER_ENDPOINTS;

  public guid(): string {
    return '<New Endpoint>' + this.name;
  }
}
