
import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import {
  ADD_PARAMS,
  AddParams,
  ResetPagination,
  REMOVE_PARAMS,
  RemoveParams,
  SET_PARAMS,
  SetParams,
} from '../actions/pagination.actions';
import { AppState } from './../app-state';


@Injectable()
export class PaginationEffects {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>
  ) { }

  @Effect({ dispatch: false }) clearPaginationOnParamChange$ =
  this.actions$.ofType<SetParams | AddParams | RemoveParams>(SET_PARAMS, ADD_PARAMS, REMOVE_PARAMS).pipe(
    map(action => {
      const addAction = action as AddParams;
      if (!addAction.keepPages) {
        this.store.dispatch(new ResetPagination(action.entityKey, action.paginationKey));
      }
    }));
}
