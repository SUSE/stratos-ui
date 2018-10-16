import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '../../../../store/app-state';
import { BaseKubeGuid } from '../../kubernetes-page.types';
import { HelmReleaseService } from '../../services/helm-release.service';
import { KubernetesPodsListConfigService } from '../kubernetes-pods/kubernetes-pods-list-config.service';
import { HelmReleasePodsDataSource } from './helm-release-pods-data-source';
import { PodNameLinkComponent } from '../kubernetes-pods/pod-name-link/pod-name-link.component';


@Injectable()
export class HelmReleasePodsListConfigService extends KubernetesPodsListConfigService {
  constructor(
    store: Store<AppState>,
    kubeId: BaseKubeGuid,
    public helmReleaseService: HelmReleaseService,
  ) {
    super(store, kubeId);
    this.podsDataSource = new HelmReleasePodsDataSource(store, kubeId, this, helmReleaseService);
  }

}
