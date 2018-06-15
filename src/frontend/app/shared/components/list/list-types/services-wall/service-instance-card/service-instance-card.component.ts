import { Component, OnInit, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';

import { IServiceInstance, IServiceExtra } from '../../../../../../core/cf-api-svc.types';
import { ServicesWallService } from '../../../../../../features/services/services/services-wall.service';
import { AppState } from '../../../../../../store/app-state';
import { APIResource } from '../../../../../../store/types/api.types';
import { ServiceActionHelperService } from '../../../../../data-services/service-action-helper.service';
import { AppChip } from '../../../../chips/chips.component';
import { MetaCardMenuItem } from '../../../list-cards/meta-card/meta-card-base/meta-card.component';
import { CardCell } from '../../../list.types';
import { CurrentUserPermissionsService } from '../../../../../../core/current-user-permissions.service';
import { CurrentUserPermissions } from '../../../../../../core/current-user-permissions.config';
import { ComponentEntityMonitorConfig } from '../../../../../shared.types';
import { entityFactory, serviceInstancesSchemaKey } from '../../../../../../store/helpers/entity-factory';

@Component({
  selector: 'app-service-instance-card',
  templateUrl: './service-instance-card.component.html',
  styleUrls: ['./service-instance-card.component.scss'],
  providers: [
    ServicesWallService
  ]
})
export class ServiceInstanceCardComponent extends CardCell<APIResource<IServiceInstance>> implements OnInit {
  serviceInstanceEntity: APIResource<IServiceInstance>;
  cfGuid: string;
  cardMenu: MetaCardMenuItem[];

  serviceInstanceTags: AppChip[];
  hasMultipleBindings = new BehaviorSubject(true);
  entityConfig: ComponentEntityMonitorConfig;

  @Input('row')
  set row(row) {
    if (row) {
      this.entityConfig = new ComponentEntityMonitorConfig(row.metadata.guid, entityFactory(serviceInstancesSchemaKey));
      this.serviceInstanceEntity = row;
      this.serviceInstanceTags = row.entity.tags.map(t => ({
        value: t
      }));
      this.cfGuid = row.entity.cfGuid;
      this.hasMultipleBindings.next(!(row.entity.service_bindings.length > 0));
    }
  }

  constructor(
    private serviceActionHelperService: ServiceActionHelperService,
    private currentUserPermissionsService: CurrentUserPermissionsService
  ) {
    super();
  }

  ngOnInit() {
    this.serviceInstanceTags = this.serviceInstanceEntity.entity.tags.map(t => ({
      value: t
    }));

    this.cardMenu = [
      {
        label: 'Edit',
        action: this.edit,
        can: this.currentUserPermissionsService.can(
          CurrentUserPermissions.SERVICE_INSTANCE_EDIT,
          this.serviceInstanceEntity.entity.cfGuid,
          this.serviceInstanceEntity.entity.space_guid
        )
      },
      {
        label: 'Unbind',
        action: this.detach,
        disabled: observableOf(this.serviceInstanceEntity.entity.service_bindings.length === 0),
        can: this.currentUserPermissionsService.can(
          CurrentUserPermissions.SERVICE_INSTANCE_EDIT,
          this.serviceInstanceEntity.entity.cfGuid,
          this.serviceInstanceEntity.entity.space_guid
        )
      },
      {
        label: 'Delete',
        action: this.delete,
        can: this.currentUserPermissionsService.can(
          CurrentUserPermissions.SERVICE_INSTANCE_DELETE,
          this.serviceInstanceEntity.entity.cfGuid,
          this.serviceInstanceEntity.entity.space_guid
        )
      }
    ];
  }
  detach = () => {
    this.serviceActionHelperService.detachServiceBinding
      (this.serviceInstanceEntity.entity.service_bindings,
      this.serviceInstanceEntity.metadata.guid,
      this.serviceInstanceEntity.entity.cfGuid);
  }

  delete = () => this.serviceActionHelperService.deleteServiceInstance(
    this.serviceInstanceEntity.metadata.guid,
    this.serviceInstanceEntity.entity.cfGuid
  )

  edit = () => this.serviceActionHelperService.editServiceBinding(
    this.serviceInstanceEntity.metadata.guid,
    this.serviceInstanceEntity.entity.cfGuid
  )

  getServiceName = () => {
    const serviceEntity = this.serviceInstanceEntity.entity.service_plan.entity.service;
    let extraInfo: IServiceExtra = null;
    try {
      extraInfo = serviceEntity.entity.extra ? JSON.parse(serviceEntity.entity.extra) : null;
    } catch (e) { }
    let displayName = serviceEntity.entity.label;
    if (extraInfo && extraInfo.displayName) {
      displayName = extraInfo.displayName;
    }
    return displayName;
  }

}
