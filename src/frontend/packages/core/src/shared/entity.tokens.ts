import { InjectionToken } from '@angular/core';

import { EntityService } from '../../../store/src/entity-service';

export const CF_GUID = new InjectionToken<string>('cfGuid');
export const APP_GUID = new InjectionToken<string>('appGuid');

export const ENTITY_SERVICE = new InjectionToken<EntityService>(null);
