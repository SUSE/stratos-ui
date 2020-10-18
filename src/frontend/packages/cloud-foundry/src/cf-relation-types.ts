import moment from 'moment';

import { EndpointRelationshipTypeMetadataJob, EndpointRelationshipTypes } from '../../store/src/types/endpoint.types';

export enum CfRelationTypes {
  /**
   * Metrics endpoint provides cf metrics to a cloud foundry endpoint
   */
  METRICS_CF = 'metrics-cf',
  /**
   * Metrics endpoint provides eirini (kube) metrics to a cloud foundry endpoint
   */
  METRICS_EIRINI = 'metrics-eirini',
  /*
   * // TODO: RC
   * Should match KubeRelationTypes.METRICS_KUBE. Not used directly to avoid cf -- kube package connection
   */
  METRICS_KUBE = 'metrics-kube'
}

EndpointRelationshipTypes[CfRelationTypes.METRICS_CF] = {
  label: 'Cloud Foundry Metrics',
  metadata: [
    {
      icon: 'history',
      value: (relMetadata: any) => relMetadata.job,
      label: 'Prometheus Job',
    },
    {
      type: EndpointRelationshipTypeMetadataJob,
      icon: 'help_outline',
      value: (job: any) => job.health ? (job.health as string).toUpperCase() : '',
      label: 'Exporter Health',
    },
    {
      type: EndpointRelationshipTypeMetadataJob,
      icon: 'schedule',
      value: (job: any) => job.lastScrape ? moment(job.lastScrape).format('LLL') : 'None',
      label: 'Exporter Last Scrape',
    },
    {
      type: EndpointRelationshipTypeMetadataJob,
      icon: 'error_outline',
      value: (job: any) => job.lastError || 'None',
      label: 'Exporter Last Error',
    },
  ]
};

EndpointRelationshipTypes[CfRelationTypes.METRICS_EIRINI] = {
  label: 'Eirini Metrics',
  metadata: [
    {
      icon: 'namespace',
      iconFont: 'stratos-icons',
      value: (relMetadata: any) => relMetadata.namespace,
      label: 'Eirini Pod Namespace',
    },
  ]
};
