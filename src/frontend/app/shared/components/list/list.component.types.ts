import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { IListDataSource } from './data-sources-controllers/list-data-source-types';
import { ITableColumn, ITableText } from './list-table/table.types';
import { Type } from '@angular/core';
import { ListView } from '../../../store/actions/list.actions';
import { defaultClientPaginationPageSize } from '../../../store/reducers/pagination-reducer/pagination.reducer';

export enum ListViewTypes {
  CARD_ONLY = 'cardOnly',
  TABLE_ONLY = 'tableOnly',
  BOTH = 'both'
}

export interface IListConfig<T> {
  /**
   * List of actions that are presented as individual buttons and applies to general activities surrounding the list (not specific to rows).
   * For example `Add`
   */
  getGlobalActions: () => IGlobalListAction<T>[];
  /**
   * List of actions that are presented as individual buttons when one or more rows are selected. For example `Delete` of selected rows.
   */
  getMultiActions: () => IMultiListAction<T>[];
  /**
   * List of actions that are presented in a mat-menu for an individual entity. For example `unmap` an application route
   */
  getSingleActions: () => IListAction<T>[];
  /**
   * Collection of column definitions to show when the list is in table mode
   */
  getColumns: () => ITableColumn<T>[];
  /**
   * The data source used to provide list entries. This will be custom per data type
   */
  getDataSource: () => IListDataSource<T>;
  /**
   * Collection of configuration objects to support multiple drops downs for filtering local lists. For example the application wall filters
   * by cloud foundry, organization and space. This mechanism supports only the showing and storing of such filters. An additional function
   * to the data sources transformEntities collection should be used to apply these custom settings to the data.
   */
  getMultiFiltersConfigs: () => IListMultiFilterConfig[];
  /**
   * Fetch an observable that will emit once the underlying config components have been created. For instance if the data source requires
   * something from the store which requires an async call
   */
  getInitialised?: () => Observable<boolean>;
  /**
   * A collection of numbers used to define how many entries per page should be shown. If missing a default will be used per table view type
   */
  pageSizeOptions?: number[];
  /**
   * What different views the user can select (table/cards)
   */
  viewType: ListViewTypes;
  /**
   * What is the initial view that the list will be displayed as (table/cards)
   */
  defaultView?: ListView;
  /**
   * Override the default list text
   */
  text?: ITableText;
  /**
   * Enable a few text filter... other config required
   */
  enableTextFilter?: boolean;
  /**
   * Fix the height of a table row
   */
  tableFixedRowHeight?: boolean;
  /**
   * The card component used in card view
   */
  cardComponent?: any;
}

export interface IListMultiFilterConfig {
  key: string;
  label: string;
  list$: Observable<IListMultiFilterConfigItem[]>;
  loading$: Observable<boolean>;
  select: BehaviorSubject<any>;
}

export interface IListMultiFilterConfigItem {
  label: string;
  item: any;
  value: string;
}

export const defaultPaginationPageSizeOptionsCards = [defaultClientPaginationPageSize, 30, 80];
export const defaultPaginationPageSizeOptionsTable = [5, 20, 80];

export class ListConfig<T> implements IListConfig<T> {
  isLocal = false;
  pageSizeOptions = defaultPaginationPageSizeOptionsCards;
  viewType = ListViewTypes.BOTH;
  text = null;
  enableTextFilter = false;
  tableFixedRowHeight = false;
  cardComponent = null;
  defaultView = 'table' as ListView;
  getGlobalActions = (): IGlobalListAction<T>[] => null;
  getMultiActions = (): IMultiListAction<T>[] => null;
  getSingleActions = (): IListAction<T>[] => null;
  getColumns = (): ITableColumn<T>[] => null;
  getDataSource = () => null;
  getMultiFiltersConfigs = (): IListMultiFilterConfig[] => [];
  getInitialised = () => Observable.of(true);
}

export interface IBaseListAction<T> {
  icon?: string;
  label: string;
  description: string;
  visible: (row: T) => boolean;
  enabled: (row: T) => boolean | Observable<T>;
}

export interface IListAction<T> extends IBaseListAction<T> {
  action: (item: T) => void;
}

export interface IMultiListAction<T> extends IBaseListAction<T> {
  /**
   * Return true if the selection should be cleared
   *
   * @memberof IMultiListAction
   */
  action: (items: T[]) => boolean;
}

export interface IGlobalListAction<T> extends IBaseListAction<T> {
  action: () => void;
}
