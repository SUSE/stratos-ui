import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import {
  PodUsageComponent,
} from '../../../../../src/frontend/app/custom/kubernetes/helm-release-pod/pod-usage/pod-usage.component';
import {
  HelmReleasePodsTabComponent,
} from '../../../../../src/frontend/app/custom/kubernetes/helm-release/helm-release-tabs-base/helm-release-pods-tab/helm-release-pods-tab.component';
import {
  HelmReleasePodNameLinkComponent,
} from '../../../../../src/frontend/app/custom/kubernetes/list-types/helm-release-pods/helm-release-pod-name-link/helm-release-pod-name-link.component';
import { CoreModule } from '../../core/core.module';
import { SharedModule } from '../../shared/shared.module';
import { HelmReleasePodComponent } from './helm-release-pod/helm-release-pod.component';
import { HelmReleaseBaseComponent } from './helm-release/helm-release-base/helm-release-base.component';
import {
  HelmReleaseServicesComponent,
} from './helm-release/helm-release-tabs-base/helm-release-services/helm-release-services.component';
import {
  HelmReleaseSummaryCardComponent,
} from './helm-release/helm-release-tabs-base/helm-release-summary/helm-release-summary-card/helm-release-summary-card.component';
import {
  HelmReleaseSummaryComponent,
} from './helm-release/helm-release-tabs-base/helm-release-summary/helm-release-summary.component';
import { HelmReleaseTabsBaseComponent } from './helm-release/helm-release-tabs-base/helm-release-tabs-base.component';
import { HelmReleaseComponent } from './helm-release/helm-release.component';
import { PodChartComponent } from './helm-release/metrics/pod-chart/pod-chart.component';
import {
  KubernetesNamespacePodsComponent,
} from './kubernetes-namespace/kubernetes-namespace-pods/kubernetes-namespace-pods.component';
import { KubernetesNamespaceComponent } from './kubernetes-namespace/kubernetes-namespace.component';
import {
  KubernetesNodeMetricStatsCardComponent,
} from './kubernetes-node/kubernetes-node-metrics/kubernetes-node-metric-stats-card/kubernetes-node-metric-stats-card.component';
import {
  KubernetesNodeMetricsChartComponent,
} from './kubernetes-node/kubernetes-node-metrics/kubernetes-node-metrics-chart/kubernetes-node-metrics-chart.component';
import { KubernetesNodeMetricsComponent } from './kubernetes-node/kubernetes-node-metrics/kubernetes-node-metrics.component';
import {
  KubernetesNodeSimpleMetricComponent,
} from './kubernetes-node/kubernetes-node-metrics/kubernetes-node-simple-metric/kubernetes-node-simple-metric.component';
import { KubernetesNodePodsComponent } from './kubernetes-node/kubernetes-node-pods/kubernetes-node-pods.component';
import { KubernetesNodeComponent } from './kubernetes-node/kubernetes-node.component';
import { BaseKubeGuid } from './kubernetes-page.types';
import { KubernetesTabBaseComponent } from './kubernetes-tab-base/kubernetes-tab-base.component';
import { KubernetesRoutingModule } from './kubernetes.routing';
import { KubernetesComponent } from './kubernetes/kubernetes.component';
import { AppLinkComponent } from './list-types/kubernetes-apps/app-link/app-link.component';
import {
  KubernetesNamespaceLinkComponent,
} from './list-types/kubernetes-namespaces/kubernetes-namespace-link/kubernetes-namespace-link.component';
import {
  KubernetesNodePodsLinkComponent,
} from './list-types/kubernetes-node-pods/kubernetes-node-pods-link/kubernetes-node-pods-link.component';
import { ConditionCellComponent } from './list-types/kubernetes-nodes/condition-cell/condition-cell.component';
import {
  KubernetesNodeCapacityComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-capacity/kubernetes-node-capacity.component';
import {
  KubernetesNodeLinkComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-link/kubernetes-node-link.component';
import {
  KubernetesNodeConditionCardComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-summary/kubernetes-node-condition-card/kubernetes-node-condition-card.component';
import {
  KubernetesNodeConditionComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-summary/kubernetes-node-condition-card/kubernetes-node-condition/kubernetes-node-condition.component';
import {
  KubernetesNodeInfoCardComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-summary/kubernetes-node-info-card/kubernetes-node-info-card.component';
import {
  KubernetesNodeSummaryCardComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-summary/kubernetes-node-summary-card/kubernetes-node-summary-card.component';
import {
  KubernetesNodeSummaryComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-summary/kubernetes-node-summary.component';
import {
  KubernetesNodeTagsCardComponent,
} from './list-types/kubernetes-nodes/kubernetes-node-summary/kubernetes-node-tags-card/kubernetes-node-tags-card.component';
import { KubernetesPodTagsComponent } from './list-types/kubernetes-pods/kubernetes-pod-tags/kubernetes-pod-tags.component';
import { HelmReleaseService } from './services/helm-release.service';
import { KubernetesEndpointService } from './services/kubernetes-endpoint.service';
import { KubernetesNodeService } from './services/kubernetes-node.service';
import { KubernetesService } from './services/kubernetes.service';
import { KubernetesAppsTabComponent } from './tabs/kubernetes-apps-tab/kubernetes-apps-tab.component';
import { KubernetesNamespacesTabComponent } from './tabs/kubernetes-namespaces-tab/kubernetes-namespaces-tab.component';
import { KubernetesNodesTabComponent } from './tabs/kubernetes-nodes-tab/kubernetes-nodes-tab.component';
import { KubernetesPodsTabComponent } from './tabs/kubernetes-pods-tab/kubernetes-pods-tab.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    SharedModule,
    KubernetesRoutingModule,
  ],
  declarations: [
    KubernetesComponent,
    KubernetesNodesTabComponent,
    KubernetesTabBaseComponent,
    KubernetesNodeCapacityComponent,
    KubernetesPodsTabComponent,
    KubernetesPodTagsComponent,
    KubernetesNamespacesTabComponent,
    KubernetesAppsTabComponent,
    HelmReleaseComponent,
    AppLinkComponent,
    HelmReleaseBaseComponent,
    HelmReleaseTabsBaseComponent,
    HelmReleasePodsTabComponent,
    HelmReleaseSummaryComponent,
    HelmReleaseServicesComponent,
    HelmReleaseSummaryCardComponent,
    HelmReleasePodComponent,
    PodChartComponent,
    HelmReleasePodNameLinkComponent,
    PodUsageComponent,
    KubernetesNodeLinkComponent,
    KubernetesNodeComponent,
    KubernetesNodeSummaryComponent,
    KubernetesNodePodsComponent,
    KubernetesNodeSummaryCardComponent,
    KubernetesNodeConditionCardComponent,
    KubernetesNodeTagsCardComponent,
    KubernetesNodePodsComponent,
    KubernetesNodePodsLinkComponent,
    KubernetesNodeInfoCardComponent,
    KubernetesNodeMetricsComponent,
    KubernetesNodeConditionComponent,
    KubernetesNodeMetricsChartComponent,
    KubernetesNodeMetricStatsCardComponent,
    KubernetesNodeSimpleMetricComponent,
    ConditionCellComponent,
    KubernetesNamespaceLinkComponent,
    KubernetesNamespaceComponent,
    KubernetesNamespacePodsComponent
  ],
  providers: [
    KubernetesService,
    BaseKubeGuid,
    KubernetesEndpointService,
    HelmReleaseService,
    KubernetesNodeService
  ],
  entryComponents: [
    KubernetesNodeCapacityComponent,
    KubernetesPodTagsComponent,
    AppLinkComponent,
    HelmReleasePodNameLinkComponent,
    PodUsageComponent,
    KubernetesNodeLinkComponent,
    KubernetesNodePodsLinkComponent,
    ConditionCellComponent,
    KubernetesNamespaceLinkComponent
  ]
})
export class KubernetesModule {

}

