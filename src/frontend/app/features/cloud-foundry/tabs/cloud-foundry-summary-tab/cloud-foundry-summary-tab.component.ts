import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { AppState } from '../../../../store/app-state';
import { goToAppWall } from '../../cf.helpers';
import { CloudFoundryEndpointService } from '../../services/cloud-foundry-endpoint.service';

@Component({
  selector: 'app-cloud-foundry-summary-tab',
  templateUrl: './cloud-foundry-summary-tab.component.html',
  styleUrls: ['./cloud-foundry-summary-tab.component.scss']
})
export class CloudFoundrySummaryTabComponent {
  appLink: Function;
  detailsLoading$: Observable<boolean>;

  constructor(store: Store<AppState>, public cfEndpointService: CloudFoundryEndpointService) {
    this.appLink = () => {
      goToAppWall(store, cfEndpointService.cfGuid);
    };
    this.detailsLoading$ = combineLatest([
      cfEndpointService.hasAllApps$,
      cfEndpointService.users$
    ]).pipe(
      map(() => false),
      startWith(true)
    );
  }
}
