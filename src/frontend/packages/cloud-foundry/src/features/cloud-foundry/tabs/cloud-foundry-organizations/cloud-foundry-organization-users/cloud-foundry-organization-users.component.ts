import { Component } from '@angular/core';

import { ListConfig } from '../../../../../../../core/src/shared/components/list/list.component.types';
import {
  CfOrgUsersListConfigService,
} from '../../../../../shared/components/list/list-types/cf-org-users/cf-org-users-list-config.service';

@Component({
  selector: 'app-cloud-foundry-organization-users',
  templateUrl: './cloud-foundry-organization-users.component.html',
  styleUrls: ['./cloud-foundry-organization-users.component.scss'],
  providers: [{
    provide: ListConfig,
    useClass: CfOrgUsersListConfigService
  }]
})
export class CloudFoundryOrganizationUsersComponent { }
