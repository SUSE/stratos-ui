import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { distinctUntilChanged, filter, map, pairwise, publishReplay, refCount, tap, withLatestFrom, delay } from 'rxjs/operators';

import { getCurrentPageRequestInfo } from '../../../../store/reducers/pagination-reducer/pagination-reducer.helper';
import { PaginationEntityState } from '../../../../store/types/pagination.types';
import { splitCurrentPage, getCurrentPageStartIndex } from './local-list-controller.helpers';
import { tag } from 'rxjs-spy/operators/tag';
import { SetResultCount } from '../../../../store/actions/pagination.actions';

export class LocalListController<T = any> {
  public page$: Observable<T[]>;
  constructor(page$: Observable<T[]>, pagination$: Observable<PaginationEntityState>,
    postSplit?: (entities: (T | T[])[]) => void, dataFunctions?) {
    const pagesObservable$ = this.buildPagesObservable(page$, pagination$, dataFunctions);
    const currentPageIndexObservable$ = this.buildCurrentPageNumberObservable(pagination$);
    const currentPageSizeObservable$ = this.buildCurrentPageSizeObservable(pagination$);
    this.page$ = this.buildCurrentPageObservable(pagesObservable$, currentPageIndexObservable$, currentPageSizeObservable$, postSplit);
  }

  private pageSplitCache: (T | T[])[] = null;

  private buildPagesObservable(page$: Observable<T[]>, pagination$: Observable<PaginationEntityState>, dataFunctions?) {
    const cleanPagination$ = pagination$.pipe(
      distinctUntilChanged((oldVal, newVal) => !this.paginationHasChanged(oldVal, newVal))
    );

    const cleanPage$ = this.buildCleanPageObservable(page$, pagination$);

    return this.buildFullCleanPageObservable(page$, pagination$, dataFunctions);
  }

  private buildCleanPageObservable(page$: Observable<T[]>, pagination$: Observable<PaginationEntityState>) {
    return combineLatest(
      page$.pipe(
        distinctUntilChanged((oldPage, newPage) => oldPage.length === newPage.length),
      ),
      pagination$.pipe(
        filter(pagination => {
          return !getCurrentPageRequestInfo(pagination).busy;
        }),
        distinctUntilChanged((oldPag, newPag) => {
          return getCurrentPageRequestInfo(oldPag).busy === getCurrentPageRequestInfo(newPag).busy;
        }),
      )
    ).pipe(
      map(([page]) => page)
    );
  }

  private buildFullCleanPageObservable(cleanPage$: Observable<T[]>, cleanPagination$: Observable<PaginationEntityState>, dataFunctions?) {
    return combineLatest(
      cleanPagination$,
      cleanPage$
    ).pipe(
      map(([paginationEntity, entities]) => {
        if (!entities || !entities.length) {
          return [];
        }
        if (dataFunctions && dataFunctions.length) {
          entities = dataFunctions.reduce((value, fn) => {
            return fn(value, paginationEntity);
          }, entities);
        }
        this.pageSplitCache = null;
        return entities;
      })
    );
  }

  private buildCurrentPageNumberObservable(pagination$: Observable<PaginationEntityState>) {
    return pagination$.pipe(
      map(pagination => pagination.clientPagination.currentPage),
      distinctUntilChanged((oldPage, newPage) => oldPage === newPage)
    );
  }

  private buildCurrentPageSizeObservable(pagination$: Observable<PaginationEntityState>) {
    return pagination$.pipe(
      map(pagination => pagination.clientPagination.pageSize),
      distinctUntilChanged()
    );
  }

  private buildCurrentPageObservable(
    entities$: Observable<T[]>,
    currentPageNumber$: Observable<number>,
    currentPageSizeObservable$: Observable<number>,
    postSplit?: (entities: (T | T[])[]) => void
  ) {
    return combineLatest(
      entities$,
      currentPageNumber$
    ).pipe(
      withLatestFrom(currentPageSizeObservable$),
      map(([[entities, currentPage], pageSize]) => {
        const pages = this.pageSplitCache ? this.pageSplitCache : entities;
        const data = splitCurrentPage(
          pages,
          pageSize,
          currentPage
        );
        this.pageSplitCache = data.entities;
        if (postSplit) {
          postSplit(entities);
        }
        return (data.entities[data.index] || []) as T[];
      }),
      publishReplay(1),
      refCount(),
      tag('local-list')
    );
  }

  private getPaginationCompareString(paginationEntity: PaginationEntityState) {
    return paginationEntity.clientPagination.pageSize
      + paginationEntity.clientPagination.totalResults
      + paginationEntity.params['order-direction-field']
      + paginationEntity.params['order-direction']
      + paginationEntity.clientPagination.filter.string
      + Object.values(paginationEntity.clientPagination.filter.items);
    // Some outlier cases actually fetch independently from this list (looking at you app variables)
  }

  private paginationHasChanged(oldPag: PaginationEntityState, newPag: PaginationEntityState) {
    const oldPagCompareString = this.getPaginationCompareString(oldPag);
    const newPagCompareString = this.getPaginationCompareString(newPag);
    return oldPagCompareString !== newPagCompareString;
  }
}
