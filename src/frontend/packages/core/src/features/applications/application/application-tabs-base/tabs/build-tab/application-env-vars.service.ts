import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { CF_ENDPOINT_TYPE } from '../../../../../../../../cloud-foundry/cf-types';
import { appEnvVarsEntityType } from '../../../../../../../../cloud-foundry/src/cf-entity-factory';
import { GetAppEnvVarsAction } from '../../../../../../../../store/src/actions/app-metadata.actions';
import { CFAppState } from '../../../../../../../../store/src/app-state';
import {
  getPaginationObservables,
  PaginationObservables,
} from '../../../../../../../../store/src/reducers/pagination-reducer/pagination-reducer.helper';
import { APIResource } from '../../../../../../../../store/src/types/api.types';
import { OverrideAppDetails } from '../../../../../../../../store/src/types/deploy-application.types';
import { entityCatalogue } from '../../../../../../core/entity-catalogue/entity-catalogue.service';
import { PaginationMonitorFactory } from '../../../../../../shared/monitors/pagination-monitor.factory';


export interface EnvVarStratosProject {
    deploySource: EnvVarStratosProjectSource;
    deployOverrides: OverrideAppDetails;
}

export interface EnvVarStratosProjectSource {
    type: string;
    timestamp: number;
    project?: string;
    scm?: string;
    branch?: string;
    url?: string;
    commit?: string;
}

@Injectable()
export class ApplicationEnvVarsHelper {

    constructor(
        private store: Store<CFAppState>,
        private paginationMonitorFactory: PaginationMonitorFactory,

    ) { }

    createEnvVarsObs(appGuid: string, cfGuid: string): PaginationObservables<APIResource> {
        const catalogueEntity = entityCatalogue.getEntity(CF_ENDPOINT_TYPE, appEnvVarsEntityType);
        const action = new GetAppEnvVarsAction(appGuid, cfGuid);
        return getPaginationObservables<APIResource>({
            store: this.store,
            action,
            paginationMonitor: this.paginationMonitorFactory.create(
                action.paginationKey,
                catalogueEntity.getSchema()
            )
        }, true);
    }

    FetchStratosProject(appEnvVars): EnvVarStratosProject {
        if (!appEnvVars) {
            return null;
        }
        const stratosProjectString = appEnvVars.environment_json ? appEnvVars.environment_json.STRATOS_PROJECT : null;
        try {
            const res = stratosProjectString ? JSON.parse(stratosProjectString) as EnvVarStratosProject : null;
            return res;
        } catch (err) {
            // noop
        }
        return null;

    }
}
