import { Component, OnInit } from '@angular/core';
import { KubernetesService } from '../../../services/kubernetes.service';
import { KubernetesEndpointService } from '../../../services/kubernetes-endpoint.service';
import { TableCellCustom } from '../../../../../shared/components/list/list.types';
import { KubernetesNode } from '../../../store/kube.types';

@Component({
  selector: 'app-kubernetes-node-link',
  templateUrl: './kubernetes-node-link.component.html',
  styleUrls: ['./kubernetes-node-link.component.scss']
})
export class KubernetesNodeLinkComponent<T> extends TableCellCustom<KubernetesNode> implements OnInit {

  public nodeLink;
  constructor(
    private kubeEndpointService: KubernetesEndpointService
  ) {
    super();
  }

  ngOnInit() {
    this.nodeLink = `/kubernetes/${this.kubeEndpointService.kubeGuid}/nodes/${this.row.metadata.name}`;
  }

}
