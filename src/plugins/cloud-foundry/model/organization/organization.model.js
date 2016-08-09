(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.model
   * @description Organization model
   */
  angular
    .module('cloud-foundry.model')
    .run(registerOrgModel);

  registerOrgModel.$inject = [
    'app.model.modelManager',
    'app.api.apiManager',
    'app.utils.utilsService',
    '$q',
    '$log'
  ];

  function registerOrgModel(modelManager, apiManager, utils, $q, $log) {
    modelManager.register('cloud-foundry.model.organization',
      new Organization(modelManager, apiManager, utils, $q, $log));
  }

  /**
   * @memberof cloud-foundry.model
   * @name Organization
   * @param {object} modelManager - the model manager
   * @property {object} modelManager - the app's model manager
   * @param {object} apiManager - the API manager
   * @param {object} utils - the utils service
   * @param {object} $q - angular $q service
   * @param {object} $log - angular $log service
   * @property {object} modelManager - the model manager
   * @property {object} apiManager - the API manager
   * @property {object} utils - the utils service
   * @property {object} $q - angular $q service
   * @property {object} $log - angular $log service
   * @class
   */
  function Organization(modelManager, apiManager, utils, $q, $log) {
    this.apiManager = apiManager;
    this.modelManager = modelManager;
    this.$q = $q;
    this.$log = $log;
    this.utils = utils;

    this.spaceApi = apiManager.retrieve('cloud-foundry.api.Spaces');
    this.orgsApi = apiManager.retrieve('cloud-foundry.api.Organizations');
    this.orgsQuotaApi = apiManager.retrieve('cloud-foundry.api.OrganizationQuotaDefinitions');
    this.stackatoInfoModel = modelManager.retrieve('app.model.stackatoInfo');

    this.organizations = {};
    this.organizationNames = {};

    var passThroughHeader = {
      'x-cnap-passthrough': 'true'
    };

    this.makeHttpConfig = function (cnsiGuid) {
      var headers = {'x-cnap-cnsi-list': cnsiGuid};
      angular.extend(headers, passThroughHeader);
      return {
        headers: headers
      };
    };
  }

  angular.extend(Organization.prototype, {
    /**
     * @function listAllOrganizations
     * @memberof cloud-foundry.model.organization
     * @description lists all organizations
     * @param {string} cnsiGuid - The GUID of the cloud-foundry server.
     * @param {object} params - optional parameters
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    listAllOrganizations: function (cnsiGuid, params) {
      this.unCacheOrganization(cnsiGuid);
      return this.apiManager.retrieve('cloud-foundry.api.Organizations')
        .ListAllOrganizations(params, this.makeHttpConfig(cnsiGuid))
        .then(function (response) {
          return response.data.resources;
        });
    },

    /**
     * @function listAllSpacesForOrganization
     * @memberof cloud-foundry.model.organization
     * @description lists all spaces for organization
     * @param {string} cnsiGuid - The GUID of the cloud-foundry server.
     * @param {string} orgGuid - organization id
     * @param {object} params - optional parameters
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    listAllSpacesForOrganization: function (cnsiGuid, orgGuid, params) {
      return this.apiManager.retrieve('cloud-foundry.api.Organizations')
        .ListAllSpacesForOrganization(orgGuid, params, this.makeHttpConfig(cnsiGuid))
        .then(function (response) {
          return response.data.resources;
        });
    },

    /**
     * @function listAllServicesForOrganization
     * @memberof cloud-foundry.model.organization
     * @description lists all services for organization
     * @param {string} cnsiGuid - The GUID of the cloud-foundry server.
     * @param {string} orgGuid - organization id
     * @param {object} params - optional parameters
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    listAllServicesForOrganization: function (cnsiGuid, orgGuid, params) {
      return this.apiManager.retrieve('cloud-foundry.api.Organizations')
        .ListAllServicesForOrganization(orgGuid, params, this.makeHttpConfig(cnsiGuid))
        .then(function (response) {
          return response.data.resources;
        });
    },

    /**
     * @function organizationRoleToString
     * @memberof cloud-foundry.model.organization
     * @description Converts an organization role to a localized string. The list of all organization
     * roles is: org_user, org_manager, org_auditor, billing_manager
     * @param {string} role - The organization role
     * @returns {string} A localised version of the role
     * @public
     */
    organizationRoleToString: function (role) {
      switch (role) {
        case 'org_user':
          return gettext('User');
        case 'org_manager':
          return gettext('Manager');
        case 'org_auditor':
          return gettext('Auditor');
        case 'billing_manager':
          return gettext('Billing Manager');
      }
      return role;
    },

    /**
     * @function organizationRoleToStrings
     * @memberof cloud-foundry.model.organization
     * @description Converts a list of cloud-foundry organization roles to a sorted localized list.
     * The list of all organization roles is: org_user, org_manager, org_auditor, billing_manager
     * @param {Array} roles - A list of cloud-foundry organization roles
     * @returns {string} An array of localised versions of the roles
     * @public
     */
    organizationRolesToStrings: function (roles) {
      var that = this;
      var rolesOrder = ['org_manager', 'org_auditor', 'billing_manager', 'org_user'];

      if (!roles || roles.length === 0) {
        // Shouldn't happen as we should at least be a user of the org
        return [gettext('none assigned')];
      } else {
        roles.sort(function (r1, r2) {
          return rolesOrder.indexOf(r1) - rolesOrder.indexOf(r2);
        });
        // If there are more than one role, don't show the user role
        if (roles.length > 1) {
          _.remove(roles, function (role) {
            return role === 'org_user';
          });
        }
        return _.map(roles, function (role) {
          return that.organizationRoleToString(role);
        });
      }
    },

    initOrganizationCache: function (cnsiGuid, orgGuid) {
      this.organizations[cnsiGuid] = this.organizations[cnsiGuid] || {};
      this.organizationNames[cnsiGuid] = this.organizationNames[cnsiGuid] || [];
      this.organizations[cnsiGuid][orgGuid] = this.organizations[cnsiGuid][orgGuid] || {
        details: {},
        roles: {},
        services: {},
        spaces: {}
      };
    },

    fetchOrganizationPath: function (cnsiGuid, orgGuid) {
      return 'organizations.' + cnsiGuid + '.' + orgGuid;
    },

    cacheOrganizationDetails: function (cnsiGuid, orgGuid, details) {
      this.initOrganizationCache(cnsiGuid, orgGuid);
      this.organizations[cnsiGuid][orgGuid].details = details;
      this.organizationNames[cnsiGuid].push(details.org.entity.name);
    },

    cacheOrganizationUsersRoles: function (cnsiGuid, orgGuid, allUsersRoles) {
      var that = this;

      this.initOrganizationCache(cnsiGuid, orgGuid);

      // Empty the cache without changing the Object reference
      this.uncacheOrganizationUserRoles(cnsiGuid, orgGuid);

      _.forEach(allUsersRoles, function (user) {
        that.organizations[cnsiGuid][orgGuid].roles[user.metadata.guid] = user.entity.organization_roles;
      });
    },

    cacheOrganizationServices: function (cnsiGuid, orgGuid, services) {

      this.initOrganizationCache(cnsiGuid, orgGuid);

      // Empty the cache without changing the Object reference
      var servicesCache = this.organizations[cnsiGuid][orgGuid].services;
      for (var service in servicesCache) {
        if (servicesCache.hasOwnProperty(service)) {
          delete servicesCache[service];
        }
      }

      _.forEach(services, function (service) {
        servicesCache[service.metadata.guid] = service;
      });
    },

    cacheOrganizationSpaces: function (cnsiGuid, orgGuid, spaces) {

      this.initOrganizationCache(cnsiGuid, orgGuid);

      // Empty the cache without changing the Object reference
      var spaceCache = this.organizations[cnsiGuid][orgGuid].spaces;
      for (var space in spaceCache) {
        if (spaceCache.hasOwnProperty(space)) {
          delete spaceCache[space];
        }
      }
      _.forEach(spaces, function (space) {
        spaceCache[space.metadata.guid] = space;
      });
    },

    unCacheOrganization: function (cnsiGuid, orgGuid) {
      // If no org is specified uncache the entire cluster
      if (angular.isUndefined(orgGuid)) {
        delete this.organizations[cnsiGuid];
        delete this.organizationNames[cnsiGuid];
        return;
      }
      var orgName = _.get(this.organizations, [cnsiGuid, orgGuid, 'details', 'org', 'entity', 'name']);
      var idx = this.organizationNames[cnsiGuid].indexOf(orgName);
      if (idx > -1) {
        this.organizationNames[cnsiGuid].splice(idx, 1);
      }
      delete this.organizations[cnsiGuid][orgGuid];
    },

    uncacheOrganizationUserRoles: function (cnsiGuid, orgGuid) {
      var rolesCache = this.organizations[cnsiGuid][orgGuid].roles;
      for (var role in rolesCache) {
        if (rolesCache.hasOwnProperty(role)) {
          delete rolesCache[role];
        }
      }
    },

    /**
     * @function  getOrganizationDetails
     * @memberof cloud-foundry.model.organization
     * @description gather all sorts of details about an organization
     * @param {string} cnsiGuid - The GUID of the cloud-foundry server
     * @param {string} org - organization entry as returned by listAllOrganizations()
     * @param {object=} params - optional parameters
     * @returns {promise} A promise which will be resolved with the organizations's details
     * */
    getOrganizationDetails: function (cnsiGuid, org, params) {

      var that = this;

      var httpConfig = this.makeHttpConfig(cnsiGuid);
      var orgGuid = org.metadata.guid;
      var orgQuotaGuid = org.entity.quota_definition_guid;
      var createdDate = moment(org.metadata.created_at, "YYYY-MM-DDTHH:mm:ssZ");
      var userGuid = that.stackatoInfoModel.info.endpoints.hcf[cnsiGuid].user.guid;

      function getRoles(org) {
        // The users roles may be returned inline
        if (org.entity.users) {
          // Reconstruct all user roles from inline data
          return that.$q.resolve(_unsplitOrgRoles(org));
        }
        return that.orgsApi.RetrievingRolesOfAllUsersInOrganization(orgGuid, params, httpConfig).then(function (val) {
          return val.data.resources;
        });
      }

      function getUsedMem(org) {
        if (org.entity.spaces) {
          if (org.entity.spaces.length === 0) {
            return that.$q.resolve(0);
          }
          if (org.entity.spaces[0].entity.apps) { // check if apps were inlined in the spaces
            var totalMem = 0;
            _.forEach(org.entity.spaces, function (space) {
              var apps = space.entity.apps;
              _.forEach(apps, function (app) {
                // Only count running apps, like the CF API would do
                if (app.entity.state === 'STARTED') {
                  totalMem += parseInt(app.entity.memory, 10);
                }
              });
            });
            return that.$q.resolve(totalMem);
          }
        }
        return that.orgsApi.RetrievingOrganizationMemoryUsage(orgGuid, params, httpConfig).then(function (res) {
          return res.data.memory_usage_in_mb;
        });
      }

      function getInstances(org) {
        if (org.entity.spaces) {
          if (org.entity.spaces.length === 0) {
            return that.$q.resolve(0);
          }
          if (org.entity.spaces[0].entity.apps) { // check if apps were inlined in the spaces
            var totalInstances = 0;
            _.forEach(org.entity.spaces, function (space) {
              var apps = space.entity.apps;
              _.forEach(apps, function (app) {
                // Only count running apps, like the CF API would do
                if (app.entity.state === 'STARTED') {
                  totalInstances += parseInt(app.entity.instances, 10);
                }
              });
            });
            return that.$q.resolve(totalInstances);
          }
        }
        return that.orgsApi.RetrievingOrganizationInstanceUsage(orgGuid, params, httpConfig).then(function (res) {
          return res.data.instance_usage;
        });
      }

      function getRouteCount(org) {
        if (org.entity.spaces) {
          if (org.entity.spaces.length === 0) {
            return that.$q.resolve(0);
          } else {
            if (org.entity.spaces[0].entity.routes) { // check if routes were inlined in the spaces
              var totalRoutes = 0;
              _.forEach(org.entity.spaces, function (space) {
                totalRoutes += space.entity.routes.length;
              });
              return that.$q.resolve(totalRoutes);
            }
          }
        }
      }

      function getQuota(org) {
        if (org.entity.quota_definition) {
          return that.$q.resolve(org.entity.quota_definition);
        }
        return that.orgsQuotaApi.RetrieveOrganizationQuotaDefinition(orgQuotaGuid, params, httpConfig).then(function (val) {
          return val.data;
        });
      }

      var rolesP = getRoles(org); // Roles can be returned inline
      var usedMemP = getUsedMem(org); // Memory usage can be inferred from inlined apps
      var instancesP = getInstances(org); // Instance usage can be inferred from inlined apps
      var routesCountP = getRouteCount(org); // Routes can be returned inline
      var quotaP = getQuota(org); // The quota can be returned inline

      var allSpacesP, allUsersRoles;
      if (org.entity.spaces) {
        allSpacesP = that.$q.resolve(org.entity.spaces);
      }

      allSpacesP = allSpacesP || this.apiManager.retrieve('cloud-foundry.api.Organizations')
        .ListAllSpacesForOrganization(orgGuid, params, httpConfig).then(function (res) {
          return res.data.resources;
        });

      routesCountP = routesCountP || allSpacesP.then(function (spaces) {
        var promises = [];
        var spaceModel = that.modelManager.retrieve('cloud-foundry.model.space');
        _.forEach(spaces, function (space) {
          var promise = spaceModel.listAllRoutesForSpace(cnsiGuid, space.metadata.guid).then(function (res) {
            return res.length;
          }).catch(function (error) {
            that.$log.error('Failed to listAllRoutesForSpace', error);
            throw error;
          });
          promises.push(promise);
        });
        return that.$q.all(promises).then(function (appCounts) {
          var total = 0;
          _.forEach(appCounts, function (count) {
            total += count;
          });
          return total;
        });
      });

      var orgRolesP = rolesP.then(function (usersRoles) {
        var i, myRoles;

        allUsersRoles = usersRoles; // Cached later!

        // Find the connected user's roles in each org
        for (i = 0; i < usersRoles.length; i++) {
          var user = usersRoles[i];
          if (user.metadata.guid === userGuid) {
            myRoles = user.entity.organization_roles;
            break;
          }
        }
        return myRoles || [];
      });

      // Count apps in each space
      var appCountsP = allSpacesP.then(function (spaces) {
        var appsCountPromises = [];
        _.forEach(spaces, function (space) {
          var appsCountPromise;
          if (space.entity.apps) {
            appsCountPromise = that.$q.resolve(space.entity.apps.length);
          } else {
            appsCountPromise = that.spaceApi.ListAllAppsForSpace(space.metadata.guid, params, httpConfig).then(function (res) {
              return res.data.resources.length;
            }).catch(function (error) {
              that.$log.error('Failed to ListAllAppsForSpace', error);
              throw error;
            });
          }
          appsCountPromises.push(appsCountPromise);
        });
        return that.$q.all(appsCountPromises).then(function (appCounts) {
          var total = 0;
          _.forEach(appCounts, function (count) {
            total += count;
          });
          return total;
        });
      }).catch(function (error) {
        that.$log.error('Failed to ListAllSpacesForOrganization', error);
        throw error;
      });

      return this.$q.all({
        memory: usedMemP,
        quota: quotaP,
        instances: instancesP,
        appCounts: appCountsP,
        routesCountP: routesCountP,
        roles: orgRolesP,
        spaces: allSpacesP
      }).then(function (vals) {
        var details = {};

        details.cnsiGuid = cnsiGuid;
        details.guid = orgGuid;

        details.org = org;

        // Set created date for sorting
        details.created_at = createdDate.unix();

        // Set memory utilisation
        details.memUsed = vals.memory;
        details.memQuota = vals.quota.entity.memory_limit;

        details.instances = vals.instances;
        details.instancesQuota = vals.quota.entity.app_instance_limit;

        // Set total counts
        details.totalApps = vals.appCounts;
        details.totalRoutes = vals.routesCountP;

        details.roles = vals.roles;

        that.cacheOrganizationDetails(cnsiGuid, orgGuid, details);
        that.cacheOrganizationUsersRoles(cnsiGuid, orgGuid, allUsersRoles);
        that.cacheOrganizationSpaces(cnsiGuid, orgGuid, vals.spaces);

        return details;
      });
    },

    createOrganization: function (cnsiGuid, orgName) {
      var that = this;
      var httpConfig = this.makeHttpConfig(cnsiGuid);
      return that.orgsApi.CreateOrganization({name: orgName}, {}, httpConfig).then(function (res) {
        var org = res.data;
        var newOrgGuid = org.metadata.guid;
        var userGuid = that.stackatoInfoModel.info.endpoints.hcf[cnsiGuid].user.guid;
        var makeUserP = that.orgsApi.AssociateUserWithOrganization(newOrgGuid, userGuid, {}, httpConfig);
        var makeManagerP = that.orgsApi.AssociateManagerWithOrganization(newOrgGuid, userGuid, {}, httpConfig);
        return that.$q.all([makeUserP, makeManagerP]).then(function () {
          that.getOrganizationDetails(cnsiGuid, org);
        });
      });
    },

    deleteOrganization: function (cnsiGuid, orgGuid) {
      var that = this;
      return that.orgsApi.DeleteOrganization(orgGuid, {}, this.makeHttpConfig(cnsiGuid)).then(function (val) {
        that.unCacheOrganization(cnsiGuid, orgGuid);
        return val;
      });
    },

    updateOrganization: function (cnsiGuid, orgGuid, orgData) {
      var that = this;
      return that.orgsApi.UpdateOrganization(orgGuid, orgData, {}, this.makeHttpConfig(cnsiGuid)).then(function (val) {
        that.organizations[cnsiGuid][orgGuid].details.org = val.data;
        return val;
      });
    },

    refreshOrganizationUserRoles: function (cnsiGuid, orgGuid) {
      var that = this;
      return this.orgsApi.RetrievingRolesOfAllUsersInOrganization(orgGuid, null, this.makeHttpConfig(cnsiGuid))
        .then(function (val) {
          var allUsersRoles = val.data.resources;
          that.cacheOrganizationUsersRoles(cnsiGuid, orgGuid, allUsersRoles);
          // Ensures we also update inlined data for getDetails to pick up
          _splitOrgRoles(that.organizations[cnsiGuid][orgGuid].details.org, allUsersRoles);
          return allUsersRoles;
        });
    }
  });

  var ORG_ROLE_TO_KEY = {
    org_user: 'users',
    org_manager: 'managers',
    billing_manager: 'billing_managers',
    org_auditor: 'auditors'
  };

  function _shallowCloneUser(user) {
    var clone = {
      entity: _.clone(user.entity),
      metadata: _.clone(user.metadata)
    };
    if (clone.entity.organization_roles) {
      delete clone.entity.organization_roles;
    }
    return clone;
  }

  function _hasRole(user, role) {
    return user.entity.organization_roles.indexOf(role) > -1;
  }

  function _assembleOrgRoles(users, role, usersHash) {
    _.forEach(users, function (user) {
      var userKey = user.metadata.guid;
      if (!usersHash.hasOwnProperty(userKey)) {
        usersHash[userKey] = _shallowCloneUser(user);
      }
      usersHash[userKey].entity.organization_roles = usersHash[userKey].entity.organization_roles || [];
      usersHash[userKey].entity.organization_roles.push(role);
    });
  }

  /**
   * Transform split organization role properties into an array of users with an organization_roles property such as
   * returned by the: RetrievingRolesOfAllUsersInOrganization() cloud foundry API
   * @param {Object} anOrg organization object containing inlined managers etc.
   * @returns {Array} a list of Users of the organization with their organization_roles property populated
   * */
  function _unsplitOrgRoles(anOrg) {
    var usersHash = {};
    _.forEach(ORG_ROLE_TO_KEY, function (key, role) {
      _assembleOrgRoles(anOrg.entity[key], role, usersHash);
    });
    return _.values(usersHash);
  }

  function _splitOrgRoles(anOrg, usersRoles) {
    _.forEach(ORG_ROLE_TO_KEY, function (key, role) {
      // Clean while preserving ref in case directives are bound to it
      if (angular.isDefined(anOrg.entity[key])) {
        anOrg.entity[key].length = 0;
      } else {
        anOrg.entity[key] = [];
      }
      _.forEach(usersRoles, function (user) {
        if (_hasRole(user, role)) {
          anOrg.entity[key].push(user);
        }
      });
    });
  }

})();
