import { EndpointSchema } from '../actions/endpoint.actions';
import { RequestSectionKeys, TRequestTypeKeys } from '../reducers/api-request-reducer/types';

export const endpointStoreNames: {
  section: TRequestTypeKeys,
  type: string
} = {
    section: RequestSectionKeys.Other,
    type: EndpointSchema.key
  };
export type endpointConnectionStatus = 'connected' | 'disconnected' | 'unknown' | 'checking';
export interface EndpointModel {
  api_endpoint?: {
    ForceQuery: boolean,
    Fragment: string,
    Host: string,
    Opaque: string,
    Path: string,
    RawPath: string,
    RawQuery: string,
    Scheme: string,
    User: object
  };
  authorization_endpoint?: string;
  cnsi_type?: string;
  doppler_logging_endpoint?: string;
  guid?: string;
  name: string;
  skip_ssl_validation?: boolean;
  token_endpoint?: string;
  // This is generated client side when we login
  registered?: boolean;
  user?: EndpointUser;
  connectionStatus?: endpointConnectionStatus;
}

// Metadata for the user connected to an endpoint
export interface EndpointUser {
  guid: string;
  name: string;
  admin: boolean;
}

export interface EndpointState {
  loading: boolean;
  error: boolean;
  message: string;
}

// If we support more endpoint types in future, this type should be extended
export type EndpointType = 'cloud-foundry';
