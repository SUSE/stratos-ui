import { IRequestAction, IUpdateRequestAction } from '../../types/request.types';
import { getEntityRequestState, mergeUpdatingState, setEntityRequestState } from './request-helpers';

export function updateRequest(state, action: IUpdateRequestAction) {
  if (!action.apiAction.guid) {
    return state;
  }
  const apiAction = action.apiAction as IRequestAction;
  const requestState = getEntityRequestState(state, apiAction);

  requestState.updating = mergeUpdatingState(
    apiAction,
    requestState.updating,
    {
      busy: action.busy,
      error: !!action.error,
      message: '',
    }
  );
  return setEntityRequestState(state, requestState, action.apiAction);
}
