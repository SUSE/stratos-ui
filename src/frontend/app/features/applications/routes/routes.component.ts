import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

import { CfAppRoutesDataSource } from '../../../shared/components/list/list-types/app-route/cf-app-routes-data-source';
import {
  CfAppRoutesListConfigService,
} from '../../../shared/components/list/list-types/app-route/cf-app-routes-list-config.service';
import { ListConfig } from '../../../shared/components/list/list.component.types';
import { AppState } from '../../../store/app-state';
import { EntityInfo } from '../../../store/types/api.types';
import { ApplicationService } from '../application.service';

@Component({
  selector: 'app-routes',
  templateUrl: './routes.component.html',
  styleUrls: ['./routes.component.scss'],
  providers: [{
    provide: ListConfig,
    useClass: CfAppRoutesListConfigService,
  }]
})
export class RoutesComponent implements OnInit {

  constructor(
    private store: Store<AppState>,
    private appService: ApplicationService,
    private listConfig: ListConfig<EntityInfo>
  ) {
    this.routesDataSource = listConfig.getDataSource() as CfAppRoutesDataSource;
  }

  routesDataSource: CfAppRoutesDataSource;

  ngOnInit() {
  }
}
