import {
  IService,
  IServiceBinding,
  IServiceBroker,
  IServiceInstance,
  IServicePlan,
  IUserProvidedServiceInstance,
} from '../../core/src/core/cf-api-svc.types';
import {
  IApp,
  IAppSummary,
  IBuildpack,
  ICfV2Info,
  IDomain,
  IFeatureFlag,
  IOrganization,
  IOrgQuotaDefinition,
  IPrivateDomain,
  IRoute,
  ISecurityGroup,
  ISpace,
  ISpaceQuotaDefinition,
  IStack,
} from '../../core/src/core/cf-api.types';
import {
  StratosBaseCatalogueEntity,
  StratosCatalogueEndpointEntity,
  StratosCatalogueEntity,
} from '../../core/src/core/entity-catalogue/entity-catalogue-entity';
import { entityCatalogue } from '../../core/src/core/entity-catalogue/entity-catalogue.service';
import { IStratosEndpointDefinition } from '../../core/src/core/entity-catalogue/entity-catalogue.types';
import { BaseEndpointAuth } from '../../core/src/features/endpoints/endpoint-auth';
import {
  applicationAddRemoveReducer as spaceApplicationAddRemoveReducer,
} from './store/reducers/application-add-remove-reducer';
import { updateApplicationRoutesReducer } from './store/reducers/application-route.reducer';
import { endpointDisconnectRemoveEntitiesReducer } from './store/reducers/endpoint-disconnect-application.reducer';
import { updateOrganizationQuotaReducer } from './store/reducers/organization-quota.reducer';
import { updateOrganizationSpaceReducer } from './store/reducers/organization-space.reducer';
import { routeReducer, updateAppSummaryRoutesReducer } from './store/reducers/routes.reducer';
import { serviceInstanceReducer } from './store/reducers/service-instance.reducer';
import { updateSpaceQuotaReducer } from './store/reducers/space-quota.reducer';
import { endpointDisconnectUserReducer, userReducer, userSpaceOrgReducer } from './store/reducers/users.reducer';
import { APIResource } from '../../store/src/types/api.types';
import { AppStats } from './store/types/app-metadata.types';
import { GitBranch, GitCommit, GitRepo } from './store/types/git.types';
import { IFavoriteMetadata } from '../../store/src/types/user-favorites.types';
import { CfUser } from '../../store/src/types/user.types';
import { CF_ENDPOINT_TYPE } from '../cf-types';
import {
  appEnvVarsEntityType,
  appEventEntityType,
  applicationEntityType,
  appStatsEntityType,
  appSummaryEntityType,
  buildpackEntityType,
  cfEntityFactory,
  cfInfoEntityType,
  cfUserEntityType,
  domainEntityType,
  featureFlagEntityType,
  gitBranchesEntityType,
  gitCommitEntityType,
  gitRepoEntityType,
  organizationEntityType,
  privateDomainsEntityType,
  quotaDefinitionEntityType,
  routeEntityType,
  securityGroupEntityType,
  serviceBindingEntityType,
  serviceBindingNoBindingsEntityType,
  serviceBrokerEntityType,
  serviceEntityType,
  serviceInstancesEntityType,
  serviceInstancesWithNoBindingsEntityType,
  serviceInstancesWithSpaceEntityType,
  servicePlanEntityType,
  servicePlanVisibilityEntityType,
  spaceEntityType,
  spaceQuotaEntityType,
  spaceWithOrgEntityType,
  stackEntityType,
  userProvidedServiceInstanceEntityType,
} from './cf-entity-factory';
import { IAppFavMetadata, IBasicCFMetaData, IOrgFavMetadata, ISpaceFavMetadata } from './cf-metadata-types';
import { appEnvVarActionBuilders } from './entity-action-builders/application-env-var.action-builders';
import { appStatsActionBuilders } from './entity-action-builders/application-stats.action-builders';
import { appSummaryActionBuilders } from './entity-action-builders/application-summary.action-builders';
import { applicationActionBuilder } from './entity-action-builders/application.action-builders';
import { buildpackActionBuilders } from './entity-action-builders/buildpack.action-builders';
import {
  CfInfoDefinitionActionBuilders,
  cfInfoDefinitionActionBuilders,
} from './entity-action-builders/cf-info.action-builders';
import { domainActionBuilders } from './entity-action-builders/domin.action-builder';
import { featureFlagActionBuilders } from './entity-action-builders/feature-flag.action-builder';
import {
  GitBranchActionBuilders,
  gitBranchActionBuilders,
  GitCommitActionBuilders,
  gitCommitActionBuilders,
  gitRepoActionBuilders,
} from './entity-action-builders/git-action-builder';
import { organizationActionBuilders } from './entity-action-builders/organization.action-builders';
import { quotaDefinitionActionBuilder } from './entity-action-builders/quota-definition.action-builders';
import { routesActionBuilders } from './entity-action-builders/routes.action-builder';
import { securityGroupBuilders } from './entity-action-builders/security-groups.action-builder';
import { serviceBindingActionBuilders } from './entity-action-builders/service-binding.action-builders';
import { serviceBrokerActionBuilders } from './entity-action-builders/service-broker.entity-builders';
import { serviceInstanceActionBuilders } from './entity-action-builders/service-instance.action.builders';
import { servicePlanVisibilityActionBuilders } from './entity-action-builders/service-plan-visibility.action-builders';
import { servicePlanActionBuilders } from './entity-action-builders/service-plan.action-builders';
import { serviceActionBuilders } from './entity-action-builders/service.entity-builders';
import { spaceQuotaDefinitionActionBuilders } from './entity-action-builders/space-quota.action-builders';
import { spaceActionBuilders } from './entity-action-builders/space.action-builders';
import { stackActionBuilders } from './entity-action-builders/stack-action-builders';
import { userProvidedServiceActionBuilder } from './entity-action-builders/user-provided-service.action-builders';
import { userActionBuilders } from './entity-action-builders/user.action-builders';
import { CfEndpointDetailsComponent } from './shared/components/cf-endpoint-details/cf-endpoint-details.component';

export function registerCFEntities() {
  generateCFEntities().forEach(entity => entityCatalogue.register(entity));
}

export function generateCFEntities(): StratosBaseCatalogueEntity[] {
  const endpointDefinition = {
    type: CF_ENDPOINT_TYPE,
    label: 'Cloud Foundry',
    labelPlural: 'Cloud Foundry',
    icon: 'cloud_foundry',
    iconFont: 'stratos-icons',
    logoUrl: '/core/assets/endpoint-icons/cloudfoundry.png',
    authTypes: [BaseEndpointAuth.UsernamePassword, BaseEndpointAuth.SSO],
    listDetailsComponent: CfEndpointDetailsComponent,
  } as IStratosEndpointDefinition;
  return [
    generateCfEndpointEntity(endpointDefinition),
    generateCfApplicationEntity(endpointDefinition),
    generateCfSpaceEntity(endpointDefinition),
    generateCfOrgEntity(endpointDefinition),
    generateFeatureFlagEntity(endpointDefinition),
    generateStackEntity(endpointDefinition),
    generateRouteEntity(endpointDefinition),
    generateEventEntity(endpointDefinition),
    generateGitBranchEntity(endpointDefinition),
    generateGitRepoEntity(endpointDefinition),
    generateGitCommitEntity(endpointDefinition),
    generateCFDomainEntity(endpointDefinition),
    generateCFUserEntity(endpointDefinition),
    generateCFServiceInstanceEntity(endpointDefinition),
    generateCFServicePlanEntity(endpointDefinition),
    generateCFServiceEntity(endpointDefinition),
    generateCFServiceBindingEntity(endpointDefinition),
    generateCFSecurityGroupEntity(endpointDefinition),
    generateCFServicePlanVisibilityEntity(endpointDefinition),
    generateCFServiceBrokerEntity(endpointDefinition),
    generateCFBuildPackEntity(endpointDefinition),
    generateCFAppStatsEntity(endpointDefinition),
    generateCFUserProvidedServiceInstanceEntity(endpointDefinition),
    generateCFInfoEntity(endpointDefinition),
    generateCFPrivateDomainEntity(endpointDefinition),
    generateCFSpaceQuotaEntity(endpointDefinition),
    generateCFAppSummaryEntity(endpointDefinition),
    generateCFAppEnvVarEntity(endpointDefinition),
    generateCFQuotaDefinitionEntity(endpointDefinition),
  ];
}

function generateCFQuotaDefinitionEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: quotaDefinitionEntityType,
    schema: cfEntityFactory(quotaDefinitionEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IOrgQuotaDefinition>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: quotaDefinitionActionBuilder
  });
}

function generateCFAppEnvVarEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: appEnvVarsEntityType,
    schema: cfEntityFactory(appEnvVarsEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: appEnvVarActionBuilders
  });
}

function generateCFAppSummaryEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: appSummaryEntityType,
    schema: cfEntityFactory(appSummaryEntityType),
    endpoint: endpointDefinition,
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IAppSummary>>(definition, {
    dataReducers: [
      updateAppSummaryRoutesReducer,
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: appSummaryActionBuilders
  });
}

function generateCFSpaceQuotaEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: spaceQuotaEntityType,
    schema: cfEntityFactory(spaceQuotaEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<ISpaceQuotaDefinition>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: spaceQuotaDefinitionActionBuilders
  });
}

function generateCFPrivateDomainEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: privateDomainsEntityType,
    schema: cfEntityFactory(privateDomainsEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IPrivateDomain>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
  });
}

function generateCFInfoEntity(endpointDefinition: IStratosEndpointDefinition) {
  const cfInfoDefinition = {
    type: cfInfoEntityType,
    schema: cfEntityFactory(cfInfoEntityType),
    label: 'Cloud Foundry Info',
    labelPlural: 'Cloud Foundry Infos',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<ICfV2Info>, CfInfoDefinitionActionBuilders>(
    cfInfoDefinition,
    {
      actionBuilders: cfInfoDefinitionActionBuilders,
      entityBuilder: {
        getMetadata: info => ({
          guid: info.entity.name,
          name: info.entity.name,
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFUserProvidedServiceInstanceEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: userProvidedServiceInstanceEntityType,
    schema: cfEntityFactory(userProvidedServiceInstanceEntityType),
    label: 'User Provided Service Instance',
    labelPlural: 'User Provided Service Instances',
    endpoint: endpointDefinition,
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IUserProvidedServiceInstance>>(
    definition,
    {
      actionBuilders: userProvidedServiceActionBuilder,
      dataReducers: [
        serviceInstanceReducer,
        endpointDisconnectRemoveEntitiesReducer()
      ],
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.name
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFAppStatsEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: appStatsEntityType,
    schema: cfEntityFactory(appStatsEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<AppStats>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: appStatsActionBuilders
  });
}

function generateCFBuildPackEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: buildpackEntityType,
    schema: cfEntityFactory(buildpackEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IBuildpack>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: buildpackActionBuilders
  });
}

function generateCFServiceBrokerEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: serviceBrokerEntityType,
    schema: cfEntityFactory(serviceBrokerEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IServiceBroker>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: serviceBrokerActionBuilders
  });
}

function generateCFServicePlanVisibilityEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: servicePlanVisibilityEntityType,
    schema: cfEntityFactory(servicePlanVisibilityEntityType),
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<ISecurityGroup>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: servicePlanVisibilityActionBuilders
  });
}

function generateCFSecurityGroupEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: securityGroupEntityType,
    schema: cfEntityFactory(securityGroupEntityType),
    label: 'Security Group',
    labelPlural: 'Security Groups',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<ISecurityGroup>>(definition, {
    dataReducers: [
      endpointDisconnectRemoveEntitiesReducer()
    ],
    actionBuilders: securityGroupBuilders
  });
}

function generateCFServiceBindingEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: serviceBindingEntityType,
    schema: {
      default: cfEntityFactory(serviceBindingEntityType),
      [serviceBindingNoBindingsEntityType]: cfEntityFactory(serviceBindingNoBindingsEntityType)
    },
    label: 'Service Binding',
    labelPlural: 'Service Bindings',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IServiceBinding>>(
    definition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: serviceBindingActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.guid
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFServiceEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: serviceEntityType,
    schema: cfEntityFactory(serviceEntityType),
    label: 'Service',
    labelPlural: 'Services',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IService>>(
    definition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: serviceActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.label
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFServicePlanEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: servicePlanEntityType,
    schema: cfEntityFactory(servicePlanEntityType),
    label: 'Service Plan',
    labelPlural: 'Service Plans',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IServicePlan>>(
    definition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: servicePlanActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.name
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFServiceInstanceEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: serviceInstancesEntityType,
    schema: {
      default: cfEntityFactory(serviceInstancesEntityType),
      [serviceInstancesWithSpaceEntityType]: cfEntityFactory(serviceInstancesWithSpaceEntityType),
      [serviceInstancesWithNoBindingsEntityType]: cfEntityFactory(serviceInstancesWithNoBindingsEntityType),
    },
    label: 'Marketplace Service Instance',
    labelPlural: 'Marketplace Service Instances',
    endpoint: endpointDefinition,
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IServiceInstance>>(
    definition,
    {
      dataReducers: [
        serviceInstanceReducer,
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: serviceInstanceActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.name
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFUserEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: cfUserEntityType,
    schema: cfEntityFactory(cfUserEntityType),
    label: 'User',
    labelPlural: 'Users',
    endpoint: endpointDefinition,
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<CfUser>>(
    definition,
    {
      actionBuilders: userActionBuilders,
      dataReducers: [userReducer, endpointDisconnectUserReducer],
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.username || ent.entity.guid
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCFDomainEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: domainEntityType,
    schema: cfEntityFactory(domainEntityType),
    label: 'Domain',
    labelPlural: 'Domains',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<IDomain>>(
    definition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: domainActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.name
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateGitCommitEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: gitCommitEntityType,
    schema: cfEntityFactory(gitCommitEntityType),
    label: 'Git Commit',
    labelPlural: 'Git Commits',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<GitCommit>, GitCommitActionBuilders>(
    definition,
    {
      actionBuilders: gitCommitActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.commit ? ent.entity.commit.message || ent.entity.sha : ent.entity.sha
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateGitRepoEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: gitRepoEntityType,
    schema: cfEntityFactory(gitRepoEntityType),
    label: 'Git Repository',
    labelPlural: 'Git Repositories',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IFavoriteMetadata, APIResource<GitRepo>>(
    definition,
    {
      actionBuilders: gitRepoActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          name: ent.entity.full_name
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateGitBranchEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: gitBranchesEntityType,
    schema: cfEntityFactory(gitBranchesEntityType),
    label: 'Git Branch',
    labelPlural: 'Git Branches',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IBasicCFMetaData, APIResource<GitBranch>, GitBranchActionBuilders>(
    definition,
    {
      actionBuilders: gitBranchActionBuilders,
      entityBuilder: {
        getMetadata: ent => ({
          guid: ent.metadata.guid,
          name: ent.metadata.guid,
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateEventEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: appEventEntityType,
    schema: cfEntityFactory(appEventEntityType),
    label: 'Application Event',
    labelPlural: 'Application Events',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IBasicCFMetaData, APIResource>(
    definition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      entityBuilder: {
        getMetadata: app => ({
          guid: app.metadata.guid,
          name: app.metadata.guid,
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateRouteEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: routeEntityType,
    schema: cfEntityFactory(routeEntityType),
    label: 'Application Route',
    labelPlural: 'Application Routes',
    endpoint: endpointDefinition,

  };
  return new StratosCatalogueEntity<IBasicCFMetaData, APIResource<IRoute>>(
    definition,
    {
      actionBuilders: routesActionBuilders,
      dataReducers: [
        routeReducer,
        endpointDisconnectRemoveEntitiesReducer()
      ],
      entityBuilder: {
        getMetadata: app => ({
          guid: app.metadata.guid,
          name: app.entity.domain_url,
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateStackEntity(endpointDefinition: IStratosEndpointDefinition) {
  const definition = {
    type: stackEntityType,
    schema: cfEntityFactory(stackEntityType),
    label: 'Stack',
    labelPlural: 'Stacks',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IBasicCFMetaData, APIResource<IStack>>(
    definition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: stackActionBuilders,
      entityBuilder: {
        getMetadata: app => ({
          guid: app.metadata.guid,
          name: app.entity.name,
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateFeatureFlagEntity(endpointDefinition: IStratosEndpointDefinition) {
  const featureFlagDefinition = {
    type: featureFlagEntityType,
    schema: cfEntityFactory(featureFlagEntityType),
    label: 'Feature Flag',
    labelPlural: 'Feature Flags',
    endpoint: endpointDefinition
  };
  return new StratosCatalogueEntity<IBasicCFMetaData, APIResource<IFeatureFlag>>(
    featureFlagDefinition,
    {
      dataReducers: [
        endpointDisconnectRemoveEntitiesReducer()
      ],
      actionBuilders: featureFlagActionBuilders,
      entityBuilder: {
        getMetadata: app => ({
          guid: app.metadata.guid,
          name: app.entity.name,
        }),
        getGuid: metadata => metadata.guid,
      }
    }
  );
}

function generateCfEndpointEntity(endpointDefinition: IStratosEndpointDefinition) {
  return new StratosCatalogueEndpointEntity(
    endpointDefinition,
    metadata => `/cloud-foundry/${metadata.guid}`,
  );
}

function generateCfApplicationEntity(endpointDefinition: IStratosEndpointDefinition) {
  const applicationDefinition = {
    type: applicationEntityType,
    schema: cfEntityFactory(applicationEntityType),
    label: 'Application',
    labelPlural: 'Applications',
    endpoint: endpointDefinition,
  };

  return new StratosCatalogueEntity<IAppFavMetadata, APIResource<IApp>>(
    applicationDefinition,
    {
      dataReducers: [
        updateApplicationRoutesReducer(),
        endpointDisconnectRemoveEntitiesReducer()
      ],
      entityBuilder: {
        getMetadata: app => ({
          guid: app.metadata.guid,
          cfGuid: app.entity.cfGuid,
          name: app.entity.name,
        }),
        getLink: metadata => `/applications/${metadata.cfGuid}/${metadata.guid}/summary`,
        getGuid: metadata => metadata.guid,
      },
      actionBuilders: applicationActionBuilder
    },
  );
}

function generateCfSpaceEntity(endpointDefinition: IStratosEndpointDefinition) {
  const spaceDefinition = {
    type: spaceEntityType,
    schema: {
      default: cfEntityFactory(spaceEntityType),
      [spaceWithOrgEntityType]: cfEntityFactory(spaceWithOrgEntityType)
    },
    label: 'Space',
    labelPlural: 'Spaces',
    endpoint: endpointDefinition,
  };
  return new StratosCatalogueEntity<ISpaceFavMetadata, APIResource<ISpace>>(
    spaceDefinition,
    {
      actionBuilders: spaceActionBuilders,
      dataReducers: [
        updateSpaceQuotaReducer,
        endpointDisconnectRemoveEntitiesReducer(),
        spaceApplicationAddRemoveReducer(),
        userSpaceOrgReducer(true)
      ],
      entityBuilder: {
        getMetadata: space => ({
          guid: space.metadata.guid,
          orgGuid: space.entity.organization_guid ? space.entity.organization_guid : space.entity.organization.metadata.guid,
          name: space.entity.name,
          cfGuid: space.entity.cfGuid,
        }),
        getLink: metadata => `/cloud-foundry/${metadata.cfGuid}/organizations/${metadata.orgGuid}/spaces/${metadata.guid}/summary`,
        getGuid: metadata => metadata.guid
      }
    }
  );
}

function generateCfOrgEntity(endpointDefinition: IStratosEndpointDefinition) {
  const orgDefinition = {
    type: organizationEntityType,
    schema: cfEntityFactory(organizationEntityType),
    label: 'Organization',
    labelPlural: 'Organizations',
    endpoint: endpointDefinition,
  };
  return new StratosCatalogueEntity<IOrgFavMetadata, APIResource<IOrganization>>(
    orgDefinition,
    {
      actionBuilders: organizationActionBuilders,
      dataReducers: [
        updateOrganizationQuotaReducer,
        updateOrganizationSpaceReducer(),
        endpointDisconnectRemoveEntitiesReducer(),
        userSpaceOrgReducer(false)
      ],
      entityBuilder: {
        getMetadata: org => ({
          guid: org.metadata.guid,
          status: getOrgStatus(org),
          name: org.entity.name,
          cfGuid: org.entity.cfGuid,
        }),
        getLink: metadata => `/cloud-foundry/${metadata.cfGuid}/organizations/${metadata.guid}`,
        getGuid: metadata => metadata.guid
      }
    }
  );
}

function getOrgStatus(org: APIResource<IOrganization>) {
  if (!org || !org.entity || !org.entity.status) {
    return 'Unknown';
  }
  return org.entity.status.charAt(0).toUpperCase() + org.entity.status.slice(1);
}
