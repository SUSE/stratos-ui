import { compose } from '@ngrx/store';
import { Metadata, KubeAPIResource } from './kube.types';


export const getMetadataGuid = (metadata: Metadata): string =>
  getValueOrNull(metadata, 'uid');

export const getKubeAPIMetadata = (
  resource: KubeAPIResource
): Metadata => getValueOrNull(resource, 'metadata');

export const getKubeAPIResourceGuid = compose(
  getMetadataGuid,
  getKubeAPIMetadata
);

const getValueOrNull = (object, key) =>
  object ? (object[key] ? object[key] : null) : null;
