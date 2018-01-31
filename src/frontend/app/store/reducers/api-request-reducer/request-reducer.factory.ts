import { startRequest } from './start-request';
import { succeedRequest } from './succeed-request';
import { failRequest } from './fail-request';
import { IRequestArray } from './types';
import { generateDefaultState } from './request-helpers';

export function requestReducerFactory(entityList = [], actions: IRequestArray) {
  const [startAction, successAction, failedAction] = actions;
  const defaultState = generateDefaultState(entityList);
  return function apiRequestReducer(state = defaultState, action) {
    switch (action.type) {
      case startAction:
        return startRequest(state, action);
      case successAction:
        return succeedRequest(state, action);
      case failedAction:
        return failRequest(state, action);
      default:
        return state;
    }
  };
}
