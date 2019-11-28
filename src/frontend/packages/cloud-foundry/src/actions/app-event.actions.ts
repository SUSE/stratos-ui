import { QParam, QParamJoiners } from '../../../store/src/q-param';
import { PaginatedAction } from '../../../store/src/types/pagination.types';
import { cfEntityFactory } from '../cf-entity-factory';
import { appEventEntityType } from '../cf-entity-types';
import { CFStartAction } from './cf-action.types';
import { HttpRequest, HttpParams } from '@angular/common/http';

export const AppGetAllEvents = {
  GET_ALL: '[Application Event] Get all',
  GET_ALL_SUCCESS: '[Application Event] Get all success',
  GET_ALL_FAILED: '[Application Event] Get all failed',
};

export class GetAllAppEvents extends CFStartAction implements PaginatedAction {
  private static sortField = 'timestamp'; // This is the field that 'order-direction' is applied to. Cannot be changed

  constructor(public paginationKey: string, public appGuid: string, public endpointGuid) {
    super();
    this.options = new HttpRequest(
      'GET',
      'events',
      {
        params: new HttpParams({
          fromObject: {
            '': ''
          }
        })
      }
    );
  }
  actions = [
    AppGetAllEvents.GET_ALL,
    AppGetAllEvents.GET_ALL_SUCCESS,
    AppGetAllEvents.GET_ALL_FAILED
  ];

  entity = [cfEntityFactory(appEventEntityType)];
  entityType = appEventEntityType;
  options: HttpRequest<any>;
  initialParams = {
    'order-direction': 'desc',
    'order-direction-field': GetAllAppEvents.sortField,
    q: [
      new QParam('actee', this.appGuid, QParamJoiners.colon).toString(),
    ]
  };
}
