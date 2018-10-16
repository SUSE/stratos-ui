import { Validators } from '@angular/forms';

import { EndpointTypeExtension } from '../../core/extension/extension-manager-service';
import { urlValidationExpression } from '../../core/utils.service';
import { EndpointModel, EndpointType } from './../../store/types/endpoint.types';

export function getFullEndpointApiUrl(endpoint: EndpointModel) {
  return endpoint && endpoint.api_endpoint ? `${endpoint.api_endpoint.Scheme}://${endpoint.api_endpoint.Host}` : 'Unknown';
}

export function getEndpointUsername(endpoint: EndpointModel) {
  return endpoint && endpoint.user ? endpoint.user.name : '-';
}

export const DEFAULT_ENDPOINT_TYPE = 'cf';
export interface EndpointTypeHelper {
  value: EndpointType;
  label: string;
  urlValidation?: string;
  allowTokenSharing?: boolean;
  icon?: string;
  iconFont?: string;
}

export interface EndpointIcon {
  name: string;
  font: string;
}

const endpointTypes: EndpointTypeHelper[] = [
  {
    value: 'cf',
    label: 'Cloud Foundry',
    urlValidation: urlValidationExpression,
    icon: 'cloud_foundry',
    iconFont: 'stratos-icons'
  },
  {
    value: 'metrics',
    label: 'Metrics',
    allowTokenSharing: true
  },
];

const endpointAuthTypes = [
  {
    name: 'Username and Password',
    value: 'creds',
    form: {
      username: ['', Validators.required],
      password: ['', Validators.required],
    },
    types: new Array<EndpointType>('cf', 'metrics')
  },
  {
    name: 'CAASP (OIDC)',
    value: 'kubeconfig',
    form: {
      kubeconfig: ['', Validators.required],
    },
    types: new Array<EndpointType>('k8s')
  },
  {
    name: 'Single Sign-On (SSO)',
    value: 'sso',
    form: {},
    types: new Array<EndpointType>('cf')
  },
  {
    name: 'Azure AKS',
    value: 'kubeconfig-az',
    form: {
      kubeconfig: ['', Validators.required],
    },
    types: new Array<EndpointType>('k8s')
  },
  {
    name: 'AWS IAM (EKS)',
    value: 'aws-iam',
    form: {
      cluster: ['', Validators.required],
      access_key: ['', Validators.required],
      secret_key: ['', Validators.required],
    },
    types: new Array<EndpointType>('k8s')
  },
  {
    name: 'Kubernetes Cert Auth',
    value: 'kube-cert-auth',
    form: {
      cert: ['', Validators.required],
      certKey: ['', Validators.required],
    },
    types: new Array<EndpointType>('k8s')
  },
];

const endpointTypesMap = {};

export function initEndpointTypes(epTypes: EndpointTypeExtension[]) {
  epTypes.forEach(type => {
    endpointTypes.push({
      value: type.type,
      label: type.label,
      icon: type.icon,
      iconFont: type.iconFont
    });

    // Map in the authentication providers
    type.authTypes.forEach(authType => {
      const endpointAuthType = endpointAuthTypes.find(a => a.value === authType);
      if (endpointAuthType) {
        endpointAuthType.types.push(type.type);
      }
    });
  });

  // TODO: Sort alphabetically

  endpointTypes.forEach(ept => {
    endpointTypesMap[ept.value] = ept;
  });
}

// Get the name to display for a given Endpoint type
export function getNameForEndpointType(type: string): string {
  return endpointTypesMap[type] ? endpointTypesMap[type].label : 'Unknown';
}

export function getCanShareTokenForEndpointType(type: string): boolean {
  return endpointTypesMap[type] ? !!endpointTypesMap[type].allowTokenSharing : false;
}

export function getEndpointTypes() {
  return endpointTypes;
}

export function getIconForEndpoint(type: string): EndpointIcon {
  const icon = {
    name: 'settings_ethernet',
    font: ''
  };

  const ep = endpointTypesMap[type];
  if (ep && ep.icon) {
    icon.name = ep.icon;
    icon.font = ep.iconFont;
  }
  return icon;
}

export function getEndpointAuthTypes() {
  return endpointAuthTypes;
}
