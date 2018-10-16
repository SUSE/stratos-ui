import { Store } from '@ngrx/store';
import { ListDataSource } from '../../../../shared/components/list/data-sources-controllers/list-data-source';
import { IListConfig } from '../../../../shared/components/list/list.component.types';
import { getPaginationKey } from '../../../../store/actions/pagination.actions';
import { AppState } from '../../../../store/app-state';
import { entityFactory, kubernetesPodsSchemaKey } from '../../../../store/helpers/entity-factory';
import { BaseKubeGuid } from '../../kubernetes-page.types';
import { HelmReleaseService } from '../../services/helm-release.service';
import { KubernetesPod } from '../../store/kube.types';
import { GetKubernetesReleasePods } from '../../store/kubernetes.actions';



export class HelmReleasePodsDataSource extends ListDataSource<KubernetesPod, any> {

  constructor(
    store: Store<AppState>,
    kubeGuid: BaseKubeGuid,
    listConfig: IListConfig<KubernetesPod>,
    helmReleaseService: HelmReleaseService,
  ) {
    const action = new GetKubernetesReleasePods(kubeGuid.guid, helmReleaseService.helmReleaseName);
    super({
      store,
      action,
      schema: entityFactory(kubernetesPodsSchemaKey),
      getRowUniqueId: object => object.name,
      paginationKey: action.paginationKey,
      isLocal: true,
      listConfig
    });
  }

}
