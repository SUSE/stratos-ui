import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { IApp, IOrganization, ISpace } from '../../../core/cf-api.types';
import { CloudFoundryService } from '../../../shared/data-services/cloud-foundry.service';
import { GetAllOrganizationSpaces } from '../../../store/actions/organization.actions';
import { GetAllAppsInSpace } from '../../../store/actions/space.actions';
import { AppState } from '../../../store/app-state';
import { endpointSchemaKey, entityFactory, organizationSchemaKey, spaceSchemaKey } from '../../../store/helpers/entity-factory';
import { createEntityRelationPaginationKey } from '../../../store/helpers/entity-relations/entity-relations.types';
import { APIResource } from '../../../store/types/api.types';
import { CloudFoundryEndpointService } from '../../cloud-foundry/services/cloud-foundry-endpoint.service';
import { DrillDownDefinition } from './../../../shared/components/drill-down/drill-down.component';
import { PaginationMonitorFactory } from './../../../shared/monitors/pagination-monitor.factory';
import { applicationSchemaKey } from './../../../store/helpers/entity-factory';
import { EndpointModel } from './../../../store/types/endpoint.types';
import { getPaginationObservables } from '../../../store/reducers/pagination-reducer/pagination-reducer.helper';
import { PaginatedAction } from '../../../store/types/pagination.types';
import { PaginationMonitor } from '../../../shared/monitors/pagination-monitor';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  public definition: DrillDownDefinition;

  public getPagination(action: PaginatedAction, paginationMonitor: PaginationMonitor) {
    return getPaginationObservables({
      store: this.store,
      action,
      paginationMonitor
    });
  }

  constructor(private store: Store<AppState>, paginationMonitorFactory: PaginationMonitorFactory) {

    this.definition = [
      {
        title: 'Cloud Foundrys',
        request: {
          data$: paginationMonitorFactory
            .create<EndpointModel>(CloudFoundryService.EndpointList, entityFactory(endpointSchemaKey)).currentPage$
        }
      },
      {
        title: 'Organizations',
        request: (cf: EndpointModel) => {
          const action = CloudFoundryEndpointService.createGetAllOrganizations(cf.guid);
          action.includeRelations = [];
          const monitor = paginationMonitorFactory
            .create<APIResource<IOrganization>>(action.paginationKey, entityFactory(organizationSchemaKey));
          const data$ = this.getPagination(action, monitor).entities$;
          return {
            data$,
            state$: monitor.currentPageRequestState$
          };
        }
      },
      {
        title: 'Spaces',
        request: (org: APIResource<IOrganization>, [cf]: [EndpointModel]) => {
          const paginationKey = createEntityRelationPaginationKey(organizationSchemaKey, org.entity.guid);
          const action = new GetAllOrganizationSpaces(
            paginationKey,
            org.entity.guid,
            cf.guid
          );
          const monitor = paginationMonitorFactory
            .create<APIResource<ISpace>>(paginationKey, entityFactory(spaceSchemaKey));
          const data$ = this.getPagination(action, monitor).entities$;
          return {
            data$,
            state$: monitor.currentPageRequestState$
          };
        }
      },
      {
        title: 'Applications',
        request: (space: APIResource<ISpace>, [cf]: [EndpointModel]) => {
          const paginationKey = createEntityRelationPaginationKey(spaceSchemaKey, space.entity.guid);
          const action = new GetAllAppsInSpace(cf.guid, space.entity.guid, paginationKey);
          const monitor = paginationMonitorFactory
            .create<APIResource<IApp>>(paginationKey, entityFactory(applicationSchemaKey));
          const data$ = this.getPagination(action, monitor).entities$;
          return {
            data$,
            state$: monitor.currentPageRequestState$
          };
        }
      }
    ];
  }

  ngOnInit() { }
}
