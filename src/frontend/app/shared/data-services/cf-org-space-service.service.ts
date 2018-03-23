import { Injectable, Optional } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { distinctUntilChanged, map, tap, withLatestFrom, first, startWith, combineLatest } from 'rxjs/operators';

import { IOrganization, ISpace } from '../../core/cf-api.types';
import { GetAllOrganizations } from '../../store/actions/organization.actions';
import { AppState } from '../../store/app-state';
import { entityFactory, organizationSchemaKey, spaceSchemaKey } from '../../store/helpers/entity-factory';
import { createEntityRelationKey } from '../../store/helpers/entity-relations.types';
import {
  getCurrentPageRequestInfo,
  getPaginationObservables,
} from '../../store/reducers/pagination-reducer/pagination-reducer.helper';
import { endpointsRegisteredEntitiesSelector } from '../../store/selectors/endpoint.selectors';
import { EndpointModel } from '../../store/types/endpoint.types';
import { PaginationMonitorFactory } from '../monitors/pagination-monitor.factory';
import { APIResource } from '../../store/types/api.types';

export interface CfOrgSpaceItem<T = any> {
  list$: Observable<T[]>;
  loading$: Observable<boolean>;
  select: BehaviorSubject<any>;
}

export const enum CfOrgSpaceSelectMode {
  /**
   * When a parent selection changes and it contains only one child automatically select it, otherwise clear child selection
   */
  FIRST_ONLY = 1,
  /**
   * When a parent selection changes and it contains any children automatically select the first one, otherwise clear child selection
   */
  ANY = 2
}

@Injectable()
export class CfOrgSpaceDataService {
  private static CfOrgSpaceServicePaginationKey = 'endpointOrgSpaceService';

  public cf: CfOrgSpaceItem<EndpointModel>;
  public org: CfOrgSpaceItem<IOrganization>;
  public space: CfOrgSpaceItem<ISpace>;

  public paginationAction = new GetAllOrganizations(CfOrgSpaceDataService.CfOrgSpaceServicePaginationKey, null, [
    createEntityRelationKey(organizationSchemaKey, spaceSchemaKey),
  ]);

  /**
   * This will contain all org and space data
   */
  private allOrgs = getPaginationObservables<APIResource<IOrganization>>({
    store: this.store,
    action: this.paginationAction,
    paginationMonitor: this.paginationMonitorFactory.create(
      this.paginationAction.paginationKey,
      entityFactory(this.paginationAction.entityKey)
    )
  });
  private allOrgsLoading$ = this.allOrgs.pagination$.map(
    pag => getCurrentPageRequestInfo(pag).busy
  );

  private getEndpointsAndOrgs$: Observable<any>;
  private selectMode = CfOrgSpaceSelectMode.FIRST_ONLY;

  constructor(
    private store: Store<AppState>,
    public paginationMonitorFactory: PaginationMonitorFactory,
    @Optional() private _selectMode: CfOrgSpaceSelectMode,
    @Optional() public multiMode: boolean
  ) {
    // Note - normal optional parameter notation won't work with injectable
    this.selectMode = _selectMode || this.selectMode;
    this.createCf();
    this.init();
    this.createOrg();
    this.createSpace();

    // Start watching the cf/org/space plus automatically setting values only when we actually have values to auto select
    this.org.list$.pipe(
      first(),
      tap(() => {
        this.setupAutoSelectors();
      })
    ).subscribe();

  }

  private init() {
    this.getEndpointsAndOrgs$ = Observable.combineLatest(
      this.allOrgs.pagination$
        .filter(paginationEntity => {
          return !getCurrentPageRequestInfo(paginationEntity).busy;
        })
        .first(),
      this.cf.list$
    );
  }

  private createCf() {
    this.cf = {
      list$: this.store
        .select(endpointsRegisteredEntitiesSelector)
        .first()
        .map((endpoints: EndpointModel[]) => {
          return Object.values(endpoints).sort((a: EndpointModel, b: EndpointModel) => a.name.localeCompare(b.name));
        }),
      loading$: this.allOrgsLoading$,
      select: new BehaviorSubject(undefined)
    };
  }

  private validValue = (stringOrArray) => this.multiMode ? stringOrArray && stringOrArray.length : stringOrArray;
  private valueFilter = (stringOrArray, getId) => {
    return this.multiMode ?
      (entity) => stringOrArray.find(guid => guid === getId(entity)) :
      (entity) => stringOrArray = getId(entity);
  }

  private createOrg() {
    const orgList$ = Observable.combineLatest(
      this.cf.select.asObservable(),
      this.getEndpointsAndOrgs$,
      this.allOrgs.entities$
    ).map(
      ([selectedCF, endpointsAndOrgs, entities]: [string[], any, APIResource<IOrganization>[]]) => {
        if (!this.validValue(selectedCF) && entities) {
          return [];
        }
        return entities
          .map(org => org.entity)
          .filter(org => this.valueFilter(selectedCF, (compareOrg: IOrganization) => compareOrg.cfGuid)(org))
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    );

    this.org = {
      list$: orgList$,
      loading$: this.allOrgsLoading$,
      select: new BehaviorSubject(undefined)
    };
  }
  private createSpace() {
    const spaceList$ = Observable.combineLatest(
      this.org.select.asObservable(),
      this.getEndpointsAndOrgs$,
      this.allOrgs.entities$
    ).map(([selectedOrg, data, orgs]: [string | string[], any, APIResource<IOrganization>[]]) => {
      if (!this.validValue(selectedOrg)) {
        return [];
      }

      const selectedOrgs = orgs.map(org => {
        if (!this.valueFilter(selectedOrg, (compareOrg: APIResource<IOrganization>) => compareOrg.metadata.guid)(org)) {
          return [];
        }
        if (!org || !org.entity || !org.entity.spaces) {
          return [];
        }
        return org.entity.spaces.map(space => {
          const entity = { ...space.entity };
          entity.guid = space.metadata.guid;
          return entity;
        });
      });
      return [].concat(...selectedOrgs);
    });

    this.space = {
      list$: spaceList$,
      loading$: this.org.loading$,
      select: new BehaviorSubject(undefined)
    };
  }

  public getEndpointOrgs(endpointGuid: string) {
    return this.allOrgs.entities$.pipe(
      map(orgs => {
        return orgs.filter(o => o.entity.cfGuid === endpointGuid);
      })
    );
  }

  private setupAutoSelectors() {
    // Automatically select the cf on first load given the select mode setting
    this.cf.list$.pipe(
      first(),
      tap(cfs => {
        if (!!cfs.length &&
          ((this.selectMode === CfOrgSpaceSelectMode.FIRST_ONLY && cfs.length === 1) ||
            (this.selectMode === CfOrgSpaceSelectMode.ANY))
        ) {
          this.cf.select.next(this.multiMode ? [cfs[0].guid] : cfs[0].guid);
        }
      })
    ).subscribe();

    // Clear or automatically select org/space given cf
    const orgResetSub = this.cf.select.asObservable().pipe(
      startWith(undefined),
      distinctUntilChanged(),
      withLatestFrom(this.org.list$),
      tap(([selectedCF, orgs]) => {
        if (
          !!orgs.length &&
          ((this.selectMode === CfOrgSpaceSelectMode.FIRST_ONLY && orgs.length === 1) ||
            (this.selectMode === CfOrgSpaceSelectMode.ANY))
        ) {
          this.org.select.next(this.multiMode ? [orgs[0].guid] : orgs[0].guid);
        } else {
          this.org.select.next(this.multiMode ? [] : '');
          this.space.select.next(this.multiMode ? [] : '');
        }
      }),
    ).subscribe();
    this.cf.select.asObservable().finally(() => {
      orgResetSub.unsubscribe();
    });

    // Clear or automatically select space given org
    const spaceResetSub = this.org.select.asObservable().pipe(
      distinctUntilChanged(),
      withLatestFrom(this.space.list$),
      tap(([selectedOrg, spaces]) => {
        if (
          !!spaces.length &&
          ((this.selectMode === CfOrgSpaceSelectMode.FIRST_ONLY && spaces.length === 1) ||
            (this.selectMode === CfOrgSpaceSelectMode.ANY))
        ) {
          this.space.select.next(this.multiMode ? [spaces[0].guid] : spaces[0].guid);
        } else {
          this.space.select.next(this.multiMode ? [] : '');
        }
      })
    ).subscribe();
    this.org.select.asObservable().finally(() => {
      spaceResetSub.unsubscribe();
    });
  }
}
