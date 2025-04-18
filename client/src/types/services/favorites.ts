import { PagedResponse } from './common';
import { ProductDTO } from './product';

export interface SimpleChannelDTO {
  id: string;
  name: string;
  imageUrl: string;
  nickname: string;
}

export interface FavoriteFolderDTO {
  id: string;
  name: string;
  peopleId: string;
  productsPreview: ProductDTO[];  // agora vem o preview de até 3 produtos
}


export interface FavoriteStatusDTO {
  favorited: boolean;
  folders: string[];
}