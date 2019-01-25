import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { AppState } from '../../../../../store/app-state';
import { goToAppWall } from '../../../cf.helpers';
import { CloudFoundryEndpointService } from '../../../services/cloud-foundry-endpoint.service';
import { CloudFoundryOrganizationService } from '../../../services/cloud-foundry-organization.service';

@Component({
  selector: 'app-cloud-foundry-organization-summary',
  templateUrl: './cloud-foundry-organization-summary.component.html',
  styleUrls: ['./cloud-foundry-organization-summary.component.scss'],

})
export class CloudFoundryOrganizationSummaryComponent {
  appLink: Function;
  detailsLoading$: Observable<boolean>;

  constructor(
    store: Store<AppState>,
    public cfEndpointService: CloudFoundryEndpointService,
    public cfOrgService: CloudFoundryOrganizationService
  ) {
    this.appLink = () => {
      goToAppWall(store, cfOrgService.cfGuid, cfOrgService.orgGuid);
    };
    this.detailsLoading$ = combineLatest([
      cfEndpointService.hasAllApps$,
      cfOrgService.allOrgUsers$,
      cfOrgService.appCount$
    ]).pipe(
      map(() => false),
      startWith(true)
    );

  }
}
