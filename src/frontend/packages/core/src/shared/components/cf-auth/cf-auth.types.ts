export enum CFAuthResource {
  space,
  user,
  space_quota_definition,
  user_provided_service_instance,
  managed_service_instance,
  service_instance,
  organization,
  application,
  domain,
  route
}

export enum CFAuthAction {
  create,
  update,
  delete,
  rename
}

export enum CFFeatureFlagTypes {
  user_org_creation = 'user_org_creation',
  private_domain_creation = 'private_domain_creation',
  app_bits_upload = 'app_bits_upload',
  app_scaling = 'app_scaling',
  route_creation = 'route_creation',
  service_instance_creation = 'service_instance_creation',
  diego_docker = 'diego_docker',
  set_roles_by_username = 'set_roles_by_username',
  unset_roles_by_username = 'unset_roles_by_username',
  task_creation = 'task_creation',
  env_var_visibility = 'env_var_visibility',
  space_scoped_private_broker_creation = 'space_scoped_private_broker_creation',
  space_developer_env_var_visibility = 'space_developer_env_var_visibility',
  service_instance_sharing = 'service_instance_sharing',
}

export interface CFFeatureFlags {
  [type: string]: boolean;
}

export interface CfAuthUserSummary {
  // Org User
  organizations: string[];
  // Org Manager
  managed_organizations: string[];
  // Org Billing Manager
  billing_managed_organizations: string[];
  // Space Auditor
  audited_organizations: string[];
  // Space Dev
  spaces: string[];
  // Space Manager
  managed_spaces: string[];
  // Space Autditor
  audited_spaces: string[];
}

export interface CfAuthUserSummaryMapped {
  organizations: {
    audited: string[],
    billingManaged: string[],
    managed: string[],
    // User is a user in all these orgs
    all: string[]
  };
  spaces: {
    audited: string[],
    managed: string[],
    // User is a developer in this spaces
    all: string[]
  };
}

export interface CFAuthChecker {
  create: (spaceGuid?: string, orgGuid?: string) => boolean;
  update: (spaceGuid?: string, orgGuid?: string, isSpace?: boolean) => boolean;
  delete: (spaceGuid?: string, orgGuid?: string) => boolean;
  canHandle: (CFAuthResources) => boolean;
}
