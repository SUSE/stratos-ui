import { compose } from '@ngrx/store';

import { deriveEndpointFavoriteFromFavorite } from '../../../core/src/core/user-favorite-helpers';
import { AppState, IRequestEntityTypeState } from '../app-state';
import { IUserFavoriteGroup, IUserFavoritesGroups, IUserFavoritesGroupsState } from '../types/favorite-groups.types';
import { IFavoriteMetadata, UserFavorite } from '../types/user-favorites.types';


export const favoriteEntitiesSelector = (state: AppState):
  IRequestEntityTypeState<UserFavorite<IFavoriteMetadata>> => state.requestData.userFavorites;


export const favoriteGroupsStateSelector = (state: AppState): IUserFavoritesGroupsState => state.userFavoritesGroups;

export const favoriteGroupsFetchingSelector = (state: IUserFavoritesGroupsState): boolean => state.busy;

export const favoriteGroupsErrorSelector = (state: IUserFavoritesGroupsState): boolean => state.error;

export const favoriteGroupsSelector = compose(
  (state: IUserFavoritesGroupsState): IUserFavoritesGroups => state.groups,
  favoriteGroupsStateSelector
);


export const favoriteGroupSelector = (favorite: UserFavorite<IFavoriteMetadata>) => {
  const endpointFavorite = deriveEndpointFavoriteFromFavorite(favorite);
  return (groups: IUserFavoritesGroups): IUserFavoriteGroup => {
    return groups[endpointFavorite.guid];
  };
};

export const favoriteInGroupGroupSelector = (favorite: UserFavorite<IFavoriteMetadata>) => {
  return (group: IUserFavoriteGroup): boolean => {
    if (!group) {
      return false;
    }
    if (favorite.entityType === 'endpoint' && !group.ethereal) {
      return true;
    }
    return group.entitiesIds.includes(favorite.guid);
  };
};

export function isFavoriteSelector(favorite: UserFavorite<IFavoriteMetadata>) {
  return compose(
    favoriteInGroupGroupSelector(favorite),
    favoriteGroupSelector(favorite),
    favoriteGroupsSelector
  );
}

export const fetchingFavoritesSelector = compose(
  favoriteGroupsFetchingSelector,
  favoriteGroupsStateSelector
);

export const errorFetchingFavoritesSelector = compose(
  favoriteGroupsErrorSelector,
  favoriteGroupsStateSelector
);

