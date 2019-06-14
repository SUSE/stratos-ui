import { RequestOptions, URLSearchParams } from '@angular/http';

import { CFEntityConfig } from '../../../cloud-foundry/cf-types';
import {
  applicationEntityType,
  cfEntityFactory,
  domainEntityType,
  routeEntityType,
  serviceBindingEntityType,
  serviceInstancesEntityType,
} from '../../../cloud-foundry/src/cf-entity-factory';
import {
  createEntityRelationKey,
  createEntityRelationPaginationKey,
  EntityInlineChildAction,
  EntityInlineParentAction,
} from '../helpers/entity-relations/entity-relations.types';
import { CFStartAction, ICFAction } from '../types/request.types';
import { getActions } from './action.helper';

export const ASSIGN_ROUTE = '[Application] Assign route';
export const ASSIGN_ROUTE_SUCCESS = '[Application] Assign route success';
export const ASSIGN_ROUTE_FAILED = '[Application] Assign route failed';

const applicationEntitySchema = cfEntityFactory(applicationEntityType);

export class GetAppRoutes extends CFStartAction implements EntityInlineParentAction, EntityInlineChildAction {
  constructor(
    public guid: string,
    public endpointGuid: string,
    public paginationKey: string = null,
    public includeRelations: string[] = [
      createEntityRelationKey(routeEntityType, domainEntityType),
      createEntityRelationKey(routeEntityType, applicationEntityType)
    ],
    public populateMissing = true
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}/routes`;
    this.options.method = 'get';
    this.options.params = new URLSearchParams();
    this.parentGuid = guid;
    this.paginationKey = paginationKey || createEntityRelationPaginationKey(applicationEntityType, guid);
  }
  actions = [
    '[Application Routes] Get all',
    '[Application Routes] Get all success',
    '[Application Routes] Get all failed',
  ];
  initialParams = {
    'results-per-page': 100,
    page: 1,
    'order-direction': 'desc',
    'order-direction-field': 'route',
  };
  entity = [cfEntityFactory(routeEntityType)];
  entityType = routeEntityType;
  options: RequestOptions;
  flattenPagination = true;
  parentGuid: string;
  parentEntityConfig = new CFEntityConfig(applicationEntityType);
}

export class GetAppServiceBindings extends CFStartAction implements EntityInlineParentAction {
  constructor(
    public guid: string,
    public endpointGuid: string,
    public paginationKey: string = null,
    public includeRelations: string[] = [
      createEntityRelationKey(serviceBindingEntityType, serviceInstancesEntityType),
    ],
    public populateMissing = true
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}/service_bindings`;
    this.options.method = 'get';
    this.options.params = new URLSearchParams();
    this.paginationKey = paginationKey || createEntityRelationPaginationKey(applicationEntityType, guid);
  }
  actions = getActions('Application Service Bindings', 'Get All');
  initialParams = {
    'results-per-page': 100,
    page: 1,
    'order-direction': 'asc',
    'order-direction-field': 'creation',
  };
  entity = [cfEntityFactory(serviceBindingEntityType)];
  entityType = serviceBindingEntityType;
  options: RequestOptions;
}

export class AssociateRouteWithAppApplication extends CFStartAction
  implements ICFAction {
  constructor(
    public guid: string,
    public routeGuid: string,
    public endpointGuid: string
  ) {
    super();
    this.options = new RequestOptions();
    this.options.url = `apps/${guid}/routes/${routeGuid}`;
    this.options.method = 'put';
  }
  actions = [ASSIGN_ROUTE, ASSIGN_ROUTE_SUCCESS, ASSIGN_ROUTE_FAILED];
  entity = [applicationEntitySchema];
  entityType = applicationEntityType;
  options: RequestOptions;
  updatingKey = 'Assigning-Route';
}
