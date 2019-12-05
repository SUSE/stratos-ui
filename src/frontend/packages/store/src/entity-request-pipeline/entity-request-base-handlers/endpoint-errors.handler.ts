import { StratosBaseCatalogueEntity } from '../../../../core/src/core/entity-catalogue/entity-catalogue-entity';
import { SendEventAction } from '../../actions/internal-events.actions';
import { endpointSchemaKey } from '../../helpers/entity-factory';
import { ApiRequestTypes } from '../../reducers/api-request-reducer/request-helpers';
import { InternalEventSeverity, InternalEventStateMetadata } from '../../types/internal-events.types';
import { APISuccessOrFailedAction, EntityRequestAction } from '../../types/request.types';
import { ActionDispatcher } from '../entity-request-pipeline.types';
import { JetstreamError } from './handle-multi-endpoints.pipe';

export const endpointErrorsHandlerFactory = (actionDispatcher: ActionDispatcher) => (
  action: EntityRequestAction,
  catalogueEntity: StratosBaseCatalogueEntity,
  requestType: ApiRequestTypes,
  errors: JetstreamError[]
) => {
  errors.forEach(error => {
    const entityErrorAction = catalogueEntity.getRequestAction('failure', action, requestType);
    // Dispatch a error action for the specific endpoint that's failed
    const fakedAction = { ...action, endpointGuid: error.guid };
    const errorMessage = error.jetstreamErrorResponse
      ? error.jetstreamErrorResponse.error.status || error.errorCode
      : error.errorCode;
    actionDispatcher(
      new APISuccessOrFailedAction(
        entityErrorAction.type,
        fakedAction,
        errorMessage,
      )
    );
    actionDispatcher(
      new SendEventAction<InternalEventStateMetadata>(endpointSchemaKey, error.guid, {
        eventCode: error.errorCode,
        severity: InternalEventSeverity.ERROR,
        message: 'API request error',
        metadata: {
          url: error.url,
          httpMethod: action.options ? action.options.method as string : '',
          errorResponse: error.jetstreamErrorResponse,
        },
      }),
    );
  });
};
