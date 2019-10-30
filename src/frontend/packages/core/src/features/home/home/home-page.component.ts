import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

import { RouterNav } from '../../../../../store/src/actions/router.actions';
import { AppState, IRequestEntityTypeState } from '../../../../../store/src/app-state';
import { IUserFavoritesGroups } from '../../../../../store/src/types/favorite-groups.types';
import { UserFavorite } from '../../../../../store/src/types/user-favorites.types';
import { EndpointsService } from '../../../core/endpoints.service';
import { LoggerService } from '../../../core/logger.service';
import { UserFavoriteManager } from '../../../core/user-favorite-manager';
import { EntityCatalogueHelpers } from '../../../core/entity-catalogue/entity-catalogue.helper';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  public allEndpointIds$: Observable<string[]>;
  public haveRegistered$: Observable<boolean>;

  public showFilterToggle$: Observable<boolean>;
  public showFilters = false;

  constructor(
    endpointsService: EndpointsService,
    store: Store<AppState>,
    logger: LoggerService,
    public userFavoriteManager: UserFavoriteManager
  ) {
    this.allEndpointIds$ = endpointsService.endpoints$.pipe(
      map(endpoints => Object.values(endpoints).map(endpoint => endpoint.guid))
    );
    this.haveRegistered$ = endpointsService.haveRegistered$;

    // Redirect to /applications if not enabled
    endpointsService.disablePersistenceFeatures$.pipe(
      map(off => {
        if (off) {
          store.dispatch(new RouterNav({
            path: ['applications'],
            extras: {
              replaceUrl: true
            }
          }));
        }
      }),
      first()
    ).subscribe();

    this.showFilterToggle$ = userFavoriteManager.getAllFavorites().pipe(
      map(([, favEntities]: [IUserFavoritesGroups, IRequestEntityTypeState<UserFavorite>]) => {
        if (favEntities) {
          for (const favEntity of Object.values(favEntities)) {
            if (favEntity.entityType !== EntityCatalogueHelpers.endpointType) {
              return true;
            }
          }
        }
        return false;
      })
    );
  }

  public toggleShowFilters() {
    this.showFilters = !this.showFilters;
  }
}

