import { DataSource } from '@angular/cdk/table';
import { Store } from '@ngrx/store';
import { schema } from 'normalizr';
import { tag } from 'rxjs-spy/operators/tag';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OperatorFunction } from 'rxjs/interfaces';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { distinctUntilChanged } from 'rxjs/operators';
import { map, shareReplay } from 'rxjs/operators';
import { Subscription } from 'rxjs/Subscription';

import { SetResultCount } from '../../../../store/actions/pagination.actions';
import { AppState } from '../../../../store/app-state';
import {
  getCurrentPageRequestInfo,
  getPaginationObservables,
} from '../../../../store/reducers/pagination-reducer/pagination-reducer.helper';
import { PaginatedAction, PaginationEntityState } from '../../../../store/types/pagination.types';
import { IListDataSourceConfig } from './list-data-source-config';
import { getDefaultRowState, getRowUniqueId, IListDataSource, RowsState } from './list-data-source-types';
import { getDataFunctionList } from './local-filtering-sorting';
import { PaginationMonitor } from '../../../monitors/pagination-monitor';

export class DataFunctionDefinition {
  type: 'sort' | 'filter';
  orderKey?: string;
  field: string;
  static is(obj) {
    if (obj) {
      const typed = <DataFunctionDefinition>obj;
      return typed.type && typed.orderKey && typed.field;
    }
    return false;
  }
}

export function distinctPageUntilChanged(dataSource) {
  return (oldPage, newPage) => {
    const oldPageKeys = (oldPage || []).map(dataSource.getRowUniqueId).join();
    const newPageKeys = (newPage || []).map(dataSource.getRowUniqueId).join();
    return oldPageKeys === newPageKeys;
  };
}

export type DataFunction<T> = ((entities: T[], paginationState: PaginationEntityState) => T[]);
export abstract class ListDataSource<T, A = T> extends DataSource<T> implements IListDataSource<T> {

  // -------------- Public
  // Core observables
  public pagination$: Observable<PaginationEntityState>;
  public page$: Observable<T[]>;

  // Store related
  public entityKey: string;

  // Add item
  public addItem: T;
  public isAdding$ = new BehaviorSubject<boolean>(false);

  // Select item/s
  public selectedRows = new Map<string, T>();
  public isSelecting$ = new BehaviorSubject(false);
  public selectAllChecked = false;

  // Edit item
  public editRow: T;

  // Cached collections
  public filteredRows: Array<T>;
  public transformedEntities: Array<T>;

  // Misc
  public isLoadingPage$: Observable<boolean> = Observable.of(false);

  // ------------- Private
  private entities$: Observable<T>;
  private paginationToStringFn: (PaginationEntityState) => string;

  protected store: Store<AppState>;
  protected action: PaginatedAction;
  protected sourceScheme: schema.Entity;
  public getRowUniqueId: getRowUniqueId<T>;
  private getEmptyType: () => T;
  public paginationKey: string;
  private transformEntity: OperatorFunction<A[], T[]> = null;
  public isLocal = false;
  public transformEntities?: (DataFunction<T> | DataFunctionDefinition)[];
  public rowsState?: Observable<RowsState>;

  private pageSubscription: Subscription;
  private transformedEntitiesSubscription: Subscription;

  constructor(
    private config: IListDataSourceConfig<A, T>
  ) {
    super();
    this.init(config);
    const paginationMonitor = new PaginationMonitor(
      this.store,
      this.paginationKey,
      this.sourceScheme
    );
    const { pagination$, entities$ } = getPaginationObservables({
      store: this.store,
      action: this.action,
      paginationMonitor
    },
      this.isLocal
    );

    const transformEntities = this.transformEntities || [];
    // Add any additional functions via an optional listConfig, such as sorting from the column definition
    const listColumns = this.config.listConfig ? this.config.listConfig.getColumns() : [];
    listColumns.forEach(column => {
      if (DataFunctionDefinition.is(column.sort)) {
        transformEntities.push(column.sort as DataFunctionDefinition);
      }
    });

    const dataFunctions = getDataFunctionList(transformEntities);
    const transformedEntities$ = this.attachTransformEntity(entities$, this.transformEntity);
    this.transformedEntitiesSubscription = transformedEntities$.do(items => this.transformedEntities = items).subscribe();
    this.page$ = this.isLocal ?
      this.getLocalPagesObservable(transformedEntities$, pagination$, dataFunctions)
      : transformedEntities$.pipe(shareReplay(1));

    this.pageSubscription = this.page$.do(items => this.filteredRows = items).subscribe();
    this.pagination$ = pagination$;
    this.isLoadingPage$ = this.pagination$.map((pag: PaginationEntityState) => {
      return getCurrentPageRequestInfo(pag).busy && !pag.ids[pag.currentPage];
    });
  }

  init(config: IListDataSourceConfig<A, T>) {
    this.store = config.store;
    this.action = config.action;
    this.sourceScheme = config.schema;
    this.getRowUniqueId = config.getRowUniqueId;
    this.getEmptyType = config.getEmptyType ? config.getEmptyType : () => ({} as T);
    this.paginationKey = config.paginationKey;
    this.transformEntity = config.transformEntity;
    this.isLocal = config.isLocal || false;
    this.transformEntities = config.transformEntities;
    this.rowsState = config.rowsState ? config.rowsState.pipe(
      shareReplay(1)
    ) : Observable.of({}).first();

    this.addItem = this.getEmptyType();
    this.entityKey = this.sourceScheme.key;
  }
  /**
   * Will return the row state with default values filled in.
   * @param row The data for the current row
   */
  getRowState(row: T) {
    return this.rowsState.pipe(
      map(state => ({
        ...getDefaultRowState(),
        ...(state[this.getRowUniqueId(row)] || {})
      })),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  disconnect() {
    this.pageSubscription.unsubscribe();
    this.transformedEntitiesSubscription.unsubscribe();
  }

  destroy() {
    this.disconnect();
  }

  startAdd() {
    this.addItem = this.getEmptyType();
    this.isAdding$.next(true);
  }
  saveAdd() {
    this.isAdding$.next(false);
  }
  cancelAdd() {
    this.isAdding$.next(false);
  }

  selectedRowToggle(row: T) {
    const exists = this.selectedRows.has(this.getRowUniqueId(row));
    if (exists) {
      this.selectedRows.delete(this.getRowUniqueId(row));
    } else {
      this.selectedRows.set(this.getRowUniqueId(row), row);
    }
    this.isSelecting$.next(this.selectedRows.size > 0);
  }

  selectAllFilteredRows() {
    this.selectAllChecked = !this.selectAllChecked;
    for (const row of this.filteredRows) {
      if (this.selectAllChecked) {
        this.selectedRows.set(this.getRowUniqueId(row), row);
      } else {
        this.selectedRows.delete(this.getRowUniqueId(row));
      }
    }
    this.isSelecting$.next(this.selectedRows.size > 0);
  }

  selectClear() {
    this.selectedRows.clear();
    this.isSelecting$.next(false);
  }

  startEdit(rowClone: T) {
    this.editRow = rowClone;
  }

  saveEdit() {
    delete this.editRow;
  }

  cancelEdit() {
    delete this.editRow;
  }

  trackBy = (index: number, item: T) => this.getRowUniqueId(item) || item;

  attachTransformEntity(entities$, entityLettable) {
    if (entityLettable) {
      return entities$.pipe(
        this.transformEntity
      );
    } else {
      return entities$.pipe(
        map(res => res as T[])
      );
    }
  }

  getLocalPagesObservable(page$, pagination$: Observable<PaginationEntityState>, dataFunctions) {
    return combineLatest(
      pagination$,
      page$
    ).pipe(
      map(([paginationEntity, entities]) => {
        if (dataFunctions && dataFunctions.length) {
          entities = dataFunctions.reduce((value, fn) => {
            return fn(value, paginationEntity);
          }, entities);
        }
        const pages = this.splitClientPages(entities, paginationEntity.clientPagination.pageSize);
        if (
          paginationEntity.totalResults !== entities.length ||
          paginationEntity.clientPagination.totalResults !== entities.length
        ) {
          this.store.dispatch(new SetResultCount(this.entityKey, this.paginationKey, entities.length));
        }
        const pageIndex = paginationEntity.clientPagination.currentPage - 1;
        return pages[pageIndex];
      }),
      shareReplay(1),
      tag('local-list')
      );
  }

  getPaginationCompareString(paginationEntity: PaginationEntityState) {
    return Object.values(paginationEntity.clientPagination).join('.')
      + paginationEntity.params['order-direction-field']
      + paginationEntity.params['order-direction']
      + paginationEntity.clientPagination.filter.string
      + Object.values(paginationEntity.clientPagination.filter.items)
      + getCurrentPageRequestInfo(paginationEntity).busy;
    // Some outlier cases actually fetch independently from this list (looking at you app variables)
  }

  splitClientPages(entites: T[], pageSize: number): T[][] {
    if (!entites || !entites.length) {
      return [];
    }
    if (entites.length <= pageSize) {
      return [entites];
    }
    const array = [...entites];
    const pages = [];

    for (let i = 0; i < array.length; i += pageSize) {
      pages.push(array.slice(i, i + pageSize));
    }
    return pages;
  }

  connect(): Observable<T[]> {
    return this.page$.tag('actual-page-obs');
  }

  public getFilterFromParams(pag: PaginationEntityState) {
    // If data source is not local then this method must be overridden
    return '';
  }
  public setFilterParam(filter: string, pag: PaginationEntityState) {
    // If data source is not local then this method must be overridden
  }
}
