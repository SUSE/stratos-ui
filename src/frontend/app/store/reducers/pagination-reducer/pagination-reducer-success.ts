import { RequestAction } from '../../types/request.types';
import { State } from '@ngrx/store';
import { AppState } from '../../app-state';
import { PaginationAction, PaginationEntityState } from '../../types/pagination.types';

export function paginationSuccess(state: PaginationEntityState, action) {
  const params = {};
  const { apiAction } = action;
  if (apiAction.options && apiAction.options.params) {
    apiAction.options.params.paramsMap.forEach((value, key) => {
      const paramValue = value.length === 1 ? value[0] : value;
      params[key] = paramValue;
    });
  }
  const totalResults = action.totalResults || action.response.result.length;
  return {
    ...state,
    fetching: false,
    error: false,
    message: '',
    ids: {
      ...state.ids,
      [state.currentPage]: action.response.result
    },
    pageCount: action.totalPages,
    totalResults,
    clientPagination: {
      ...state.clientPagination,
      totalResults
    }
  };
}
