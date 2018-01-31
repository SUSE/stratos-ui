import { AppState } from '../app-state';
import { SET_CLIENT_FILTER, SetClientFilter, SetClientPage } from '../actions/pagination.actions';
import { Store } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Actions, Effect } from '@ngrx/effects';


@Injectable()
export class SetClientFilterEffect {

  constructor(
    private actions$: Actions,
    private store: Store<AppState>,
  ) { }

  @Effect({ dispatch: false }) clearPageNumber$ = this.actions$.ofType<SetClientFilter>(SET_CLIENT_FILTER)
    .map(action => {
      // We reset the page when a param is changed.
      this.store.dispatch(new SetClientPage(action.entityKey, action.paginationKey, 1));
    });
}

