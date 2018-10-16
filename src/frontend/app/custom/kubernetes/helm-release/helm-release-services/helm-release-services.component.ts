import { Component, OnInit } from '@angular/core';
import { ListConfig } from '../../../../shared/components/list/list.component.types';
import { HelmReleaseServicesListConfig } from '../../list-types/helm-release-services/helm-release-services-list-config.service';
@Component({
  selector: 'app-helm-release-services',
  templateUrl: './helm-release-services.component.html',
  styleUrls: ['./helm-release-services.component.scss'],
  providers: [{
    provide: ListConfig,
    useClass: HelmReleaseServicesListConfig,
  }]
})
export class HelmReleaseServicesComponent {}
