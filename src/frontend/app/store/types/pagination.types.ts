import { IRequestAction, RequestAction } from './request.types';
import { Action } from '@ngrx/store';

export class QParam {
  constructor(
    public key: string,
    public value: string | string[],
    public joiner: '>=' | '<=' | '<' | '>' | ' IN ' | ':' | '=' = ':'
  ) { }
}

export interface PaginationParam {
  q?: QParam[];
  [entityKey: string]: any;
}

export interface PaginationClientFilter {
  string: string;
  items: {
    [key: string]: any;
  };
}

export class PaginationEntityState {
  currentPage = 0;
  totalResults = 0;
  pageCount = 0;
  ids = {};
  params: PaginationParam;
  fetching: boolean;
  error: boolean;
  message: string;
  clientPagination?: {
    pageSize: number,
    currentPage: number,
    filter: PaginationClientFilter,
    totalResults: number
  };
}

export interface PaginationAction extends Action {
  entityKey: string;
  paginationKey: string;
}

export interface PaginatedAction extends PaginationAction, IRequestAction {
  flattenPagination?: boolean;
  initialParams?: PaginationParam;
  options?: {
    params?: {
      paramsMap: any;
    }
  };
}

export interface PaginationEntityTypeState {
  [paginationKey: string]: PaginationEntityState;
}

export interface PaginationState {
  [entityKey: string]: PaginationEntityTypeState;
}
