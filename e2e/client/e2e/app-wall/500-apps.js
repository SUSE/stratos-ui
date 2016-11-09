(function () {
  'use strict';

  angular
    .module('console-e2e-mocks', [])
    .run(run);

  run.$inject = [
    '$httpBackend'
  ];

  function run($httpBackend) {
    expectGetTemplates($httpBackend);
    expectGetSessionVerifiedWithSuccess($httpBackend);
    expectGetStackatoInfo($httpBackend);
    expectGetClustersWithSuccess($httpBackend);
    expectGetRegisterdClusters($httpBackend);
    expectGetHcfClusterInfo($httpBackend);
    expectGetHceClusterInfo($httpBackend);

    $httpBackend.whenGET('/pp/v1/proxy/v2/config/feature_flags').respond([]);

    $httpBackend.whenGET('/pp/v1/proxy/v2/users/ae257571-e323-4cd9-bd97-2b21223d9b36/summary').respond(
      {
        metadata: {
          guid: 'uaa-id-207',
          created_at: '2016-05-12T00:45:15Z',
          updated_at: null
        },
        entity: {
          organizations: [
            {
              metadata: {
                guid: 'a38d0083-5d1b-4505-a463-bdaa00849734',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1476',
                billing_enabled: false,
                status: 'active',
                spaces: [
                  {
                    metadata: {
                      guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      name: 'name-1478'
                    }
                  }
                ],
                quota_definition: {
                  metadata: {
                    guid: '23b0a8e9-1108-4af7-8383-e1b1a17414eb',
                    created_at: '2016-05-12T00:45:15Z',
                    updated_at: null
                  },
                  entity: {
                    name: 'name-1477',
                    non_basic_services_allowed: true,
                    total_services: 60,
                    memory_limit: 20480,
                    trial_db_allowed: false,
                    total_routes: 1000,
                    instance_memory_limit: -1,
                    total_private_domains: -1,
                    app_instance_limit: -1,
                    app_task_limit: -1
                  }
                },
                managers: [
                  {
                    metadata: {
                      guid: 'uaa-id-207',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      admin: false,
                      active: false,
                      default_space_guid: null
                    }
                  }
                ]
              }
            }
          ],
          managed_organizations: [
            {
              metadata: {
                guid: 'a38d0083-5d1b-4505-a463-bdaa00849734',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1476',
                billing_enabled: false,
                status: 'active',
                spaces: [
                  {
                    metadata: {
                      guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      name: 'name-1478'
                    }
                  }
                ],
                quota_definition: {
                  metadata: {
                    guid: '23b0a8e9-1108-4af7-8383-e1b1a17414eb',
                    created_at: '2016-05-12T00:45:15Z',
                    updated_at: null
                  },
                  entity: {
                    name: 'name-1477',
                    non_basic_services_allowed: true,
                    total_services: 60,
                    memory_limit: 20480,
                    trial_db_allowed: false,
                    total_routes: 1000,
                    instance_memory_limit: -1,
                    total_private_domains: -1,
                    app_instance_limit: -1,
                    app_task_limit: -1
                  }
                },
                managers: [
                  {
                    metadata: {
                      guid: 'uaa-id-207',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      admin: false,
                      active: false,
                      default_space_guid: null
                    }
                  }
                ]
              }
            }
          ],
          billing_managed_organizations: [
            {
              metadata: {
                guid: 'a38d0083-5d1b-4505-a463-bdaa00849734',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1476',
                billing_enabled: false,
                status: 'active',
                spaces: [
                  {
                    metadata: {
                      guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      name: 'name-1478'
                    }
                  }
                ],
                quota_definition: {
                  metadata: {
                    guid: '23b0a8e9-1108-4af7-8383-e1b1a17414eb',
                    created_at: '2016-05-12T00:45:15Z',
                    updated_at: null
                  },
                  entity: {
                    name: 'name-1477',
                    non_basic_services_allowed: true,
                    total_services: 60,
                    memory_limit: 20480,
                    trial_db_allowed: false,
                    total_routes: 1000,
                    instance_memory_limit: -1,
                    total_private_domains: -1,
                    app_instance_limit: -1,
                    app_task_limit: -1
                  }
                },
                managers: [
                  {
                    metadata: {
                      guid: 'uaa-id-207',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      admin: false,
                      active: false,
                      default_space_guid: null
                    }
                  }
                ]
              }
            }
          ],
          audited_organizations: [
            {
              metadata: {
                guid: 'a38d0083-5d1b-4505-a463-bdaa00849734',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1476',
                billing_enabled: false,
                status: 'active',
                spaces: [
                  {
                    metadata: {
                      guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      name: 'name-1478'
                    }
                  }
                ],
                quota_definition: {
                  metadata: {
                    guid: '23b0a8e9-1108-4af7-8383-e1b1a17414eb',
                    created_at: '2016-05-12T00:45:15Z',
                    updated_at: null
                  },
                  entity: {
                    name: 'name-1477',
                    non_basic_services_allowed: true,
                    total_services: 60,
                    memory_limit: 20480,
                    trial_db_allowed: false,
                    total_routes: 1000,
                    instance_memory_limit: -1,
                    total_private_domains: -1,
                    app_instance_limit: -1,
                    app_task_limit: -1
                  }
                },
                managers: [
                  {
                    metadata: {
                      guid: 'uaa-id-207',
                      created_at: '2016-05-12T00:45:15Z',
                      updated_at: null
                    },
                    entity: {
                      admin: false,
                      active: false,
                      default_space_guid: null
                    }
                  }
                ]
              }
            }
          ],
          spaces: [
            {
              metadata: {
                guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1478'
              }
            }
          ],
          managed_spaces: [
            {
              metadata: {
                guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1478'
              }
            }
          ],
          audited_spaces: [
            {
              metadata: {
                guid: 'fa588a74-c087-479c-b39d-4cbb5f293e5f',
                created_at: '2016-05-12T00:45:15Z',
                updated_at: null
              },
              entity: {
                name: 'name-1478'
              }
            }
          ]
        }
      }
    );

    var apps = [];
    for (var i = 0; i < 500; i++) { apps[i] = createFakeApp(); }

    $httpBackend.whenGET('/pp/v1/proxy/v2/apps?page=1&results-per-page=100').respond({
      '8221adff-529a-4567-b57a-155fb69f1bd0': {
        total_results: 100,
        total_pages: 5,
        prev_url: null,
        next_url: null,
        resources: apps.slice(0, 100)
      }
    });

    $httpBackend.whenGET('/pp/v1/proxy/v2/apps?page=2&results-per-page=100').respond({
      '8221adff-529a-4567-b57a-155fb69f1bd0': {
        total_results: 100,
        total_pages: 5,
        prev_url: null,
        next_url: null,
        resources: apps.slice(100, 200)
      }
    });

    $httpBackend.whenGET('/pp/v1/proxy/v2/apps?page=3&results-per-page=100').respond({
      '8221adff-529a-4567-b57a-155fb69f1bd0': {
        total_results: 100,
        total_pages: 5,
        prev_url: null,
        next_url: null,
        resources: apps.slice(200, 300)
      }
    });

    $httpBackend.whenGET('/pp/v1/proxy/v2/apps?page=4&results-per-page=100').respond({
      '8221adff-529a-4567-b57a-155fb69f1bd0': {
        total_results: 100,
        total_pages: 5,
        prev_url: null,
        next_url: null,
        resources: apps.slice(300, 400)
      }
    });

    $httpBackend.whenGET('/pp/v1/proxy/v2/apps?page=5&results-per-page=100').respond({
      '8221adff-529a-4567-b57a-155fb69f1bd0': {
        total_results: 100,
        total_pages: 5,
        prev_url: null,
        next_url: null,
        resources: apps.slice(400, 500)
      }
    });
  }

  function expectGetTemplates($httpBackend) {
    $httpBackend.whenGET(/.+\.html$/).passThrough();
  }

  function expectGetSessionVerifiedWithSuccess($httpBackend) {
    $httpBackend.whenGET('/pp/v1/auth/session/verify').respond(200, {
      admin: true
    });
  }

  function expectGetStackatoInfo($httpBackend) {
    $httpBackend.whenGET('/pp/v1/stackato/info').respond(200, {
      version: {
        proxy_version: 'dev',
        database_version: 20160511195737
      },
      user: {
        guid: '63ddbbe1-a185-465d-ba10-63d5c01f1a99',
        name: 'admin@cnap.local',
        admin: true
      },
      endpoints: {
        other: {
          'a0b0f8c6-d00d-47f2-8636-1f558f7ec48e': {
            guid: 'a0b0f8c6-d00d-47f2-8636-1f558f7ec48e',
            name: 'OTHER_1',
            user: {
              guid: '577f3715-8ae9-41c3-ba6e-67fff957ee48',
              name: 'hsc-admin',
              admin: false
            }
          }
        },
        hce: {
          'f0b0f8c6-d00d-47f2-8636-1f558f7ec48e': {
            guid: 'f0b0f8c6-d00d-47f2-8636-1f558f7ec48e',
            name: 'HCE_1',
            version: '',
            user: {
              guid: '577f3715-8ae9-41c3-ba6e-67fff957ee48',
              name: 'hsc-admin',
              admin: false
            },
            type: ''
          }
        },
        hcf: {
          '8221adff-529a-4567-b57a-155fb69f1bd0': {
            guid: '8221adff-529a-4567-b57a-155fb69f1bd0',
            name: 'HCF_1',
            version: '',
            user: {
              guid: 'ae257571-e323-4cd9-bd97-2b21223d9b36',
              name: 'admin',
              admin: true
            }, type: ''
          },
          '925f6b40-c0e4-4595-97e5-287c3c04b1c2': {
            guid: '925f6b40-c0e4-4595-97e5-287c3c04b1c2',
            name: 'HCF_2',
            version: '',
            user: {
              guid: '58d56fe1-cacf-484b-aa7d-61cf019e6402',
              name: 'admin',
              admin: true
            },
            type: ''
          },
          'bd4fd4f9-2001-4609-86e6-ccfa2a8ba92d': {
            guid: 'bd4fd4f9-2001-4609-86e6-ccfa2a8ba92d',
            name: 'HCF_3',
            version: '',
            user: {
              guid: 'a8b7d5ef-dee6-4e71-ae8e-348971151351',
              name: 'admin',
              admin: true
            },
            type: ''
          },
          'd13aa0f2-4500-4e0d-aa14-1b9f4e0769d8': {
            guid: 'd13aa0f2-4500-4e0d-aa14-1b9f4e0769d8',
            name: 'HCF_4',
            version: '',
            user: {
              guid: '0c97cd5a-8ef8-4f80-af46-acfa8697824e',
              name: 'test',
              admin: false
            },
            type: ''
          }
        }
      }
    });
  }

  function expectGetClustersWithSuccess($httpBackend) {
    $httpBackend.whenGET('/pp/v1/cnsis').respond(200, [
      {id: 1, name: 'HCF_1', url: ' cluster1_url', cnsi_type: 'hcf', guid: '8221adff-529a-4567-b57a-155fb69f1bd0'},
      {id: 2, name: 'HCE_1', url: ' cluster2_url', cnsi_type: 'hce', guid: 'f0b0f8c6-d00d-47f2-8636-1f558f7ec48e'}
    ]);
  }

  function expectGetRegisterdClusters($httpBackend) {
    $httpBackend.whenGET('/pp/v1/cnsis/registered').respond(200, [
      {
        valid: true,
        error: false,
        id: 1,
        name: 'HCF_1',
        url: ' cluster1_url',
        cnsi_type: 'hcf',
        guid: '8221adff-529a-4567-b57a-155fb69f1bd0'
      },
      {
        valid: true,
        error: false,
        id: 2,
        name: 'HCE_1',
        url: ' cluster2_url',
        cnsi_type: 'hce',
        guid: 'f0b0f8c6-d00d-47f2-8636-1f558f7ec48e'
      }
    ]);
  }

  function expectGetHcfClusterInfo($httpBackend) {
    $httpBackend.whenGET('/pp/v1/proxy/v2/info').respond(200, {});
  }

  function expectGetHceClusterInfo($httpBackend) {
    $httpBackend.whenGET('/pp/v1/proxy/info').respond(200, {});
  }

  var appPattern = {
    metadata: {
      guid: '1427b1dc-8531-4c8b-a46d-8a7cbca7eef6',
      url: '/v2/apps/1427b1dc-8531-4c8b-a46d-8a7cbca7eef6',
      created_at: '2016-05-12T00:45:24Z',
      updated_at: '2016-05-12T00:45:24Z'
    },
    entity: {
      name: 'name-2044',
      production: false,
      space_guid: '98587565-c115-469b-bde1-382a569cb7b6',
      stack_guid: '1c2c21ce-7aab-4c50-abb1-917915a15d21',
      buildpack: null,
      detected_buildpack: null,
      environment_json: null,
      memory: 1024,
      instances: 1,
      disk_quota: 1024,
      state: 'STOPPED',
      version: 'b40af0c0-3980-4bb7-b147-e10f3cf7dd0e',
      command: null,
      console: false,
      debug: null,
      staging_task_id: null,
      package_state: 'PENDING',
      health_check_type: 'port',
      health_check_timeout: null,
      staging_failed_reason: null,
      staging_failed_description: null,
      diego: false,
      docker_image: null,
      package_updated_at: '2016-05-12T00:45:24Z',
      detected_start_command: '',
      enable_ssh: true,
      docker_credentials_json: {
        redacted_message: '[PRIVATE DATA HIDDEN]'
      },
      ports: null,
      space_url: '/v2/spaces/98587565-c115-469b-bde1-382a569cb7b6',
      stack_url: '/v2/stacks/1c2c21ce-7aab-4c50-abb1-917915a15d21',
      routes_url: '/v2/apps/1427b1dc-8531-4c8b-a46d-8a7cbca7eef6/routes',
      events_url: '/v2/apps/1427b1dc-8531-4c8b-a46d-8a7cbca7eef6/events',
      service_bindings_url: '/v2/apps/1427b1dc-8531-4c8b-a46d-8a7cbca7eef6/service_bindings',
      route_mappings_url: '/v2/apps/1427b1dc-8531-4c8b-a46d-8a7cbca7eef6/route_mappings'
    }
  };

  function getRandomLetter(letters) {
    return letters.charAt(Math.floor(Math.random() * letters.length));
  }

  var createRandomName = (function () {
    var count = 0;
    return function () {
      var letters = '-_01234567abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var name = [];
      for (var j = 0; j < 4; j++) { name.push(getRandomLetter(letters)); }
      name.push('#' + count++);
      return name.join('');
    };
  })();

  function createFakeApp() {
    var name = createRandomName();
    return _.assign({}, appPattern, {
      metadata: {guid: name},
      entity: {name: name}
    });
  }

})();
