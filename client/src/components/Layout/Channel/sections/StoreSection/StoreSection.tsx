"use client";

import React, { FC, useEffect, useState } from 'react';
import SubButton from '../../../../UI/SubButton/SubButton';
import categoriesIcon from '../../../../../../public/assets/categories.svg';
import searchIcon from '../../../../../../public/assets/search.svg';
import storeSectionStyles from './storeSection.module.css';
import { useLocationContext } from '../../../../../context/LocationContext';
import { filterProductsByCatalogAndDelivery } from '@/services/product/productService';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import { ProductDTO } from '@/types/services/product';

interface StoreSectionProps {
  isMobile: boolean;
  handleSearchClick: () => void;
  catalogIds: string[];
}

const StoreSection: FC<StoreSectionProps> = ({ isMobile, handleSearchClick, catalogIds }) => {
  const { location } = useLocationContext();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    console.log('[Front] StoreSection - localização atual:', location);

    // Verifica se temos localização e pelo menos um catálogo
    if (location && catalogIds.length > 0) {
      setLoading(true);
      const catalogId = catalogIds[0];
      console.log('[Front] Chamando filterProductsByCatalogAndDelivery com:', {
        catalogId,
        latitude: location.latitude,
        longitude: location.longitude,
        page: 0,
        size: 10
      });

      filterProductsByCatalogAndDelivery(catalogId, location.latitude, location.longitude, 0, 10)
        .then((pagedResponse) => {
          console.log('[Front] Resposta do filterProductsByCatalogAndDelivery:', pagedResponse);
          setProducts(pagedResponse.content);
        })
        .catch((error) => {
          console.error('Erro ao buscar produtos filtrados:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [location, catalogIds]);

  return (
    <div className={storeSectionStyles.container}>
      {isMobile && (
        <div className={storeSectionStyles.subButtonsContainer}>
          <SubButton text="Categorias" backgroundColor="#212121" imageSrc={categoriesIcon} />
          <SubButton text="Pesquisar" backgroundColor="#212121" imageSrc={searchIcon} onClick={handleSearchClick} />
        </div>
      )}

      <div className={storeSectionStyles.testScrollContainer}>
        {catalogIds.length > 0 ? (
          <ul>
            {catalogIds.map((id) => (
              <li key={id}>
                Catálogo: {id} – Lat: {location?.latitude}, Lng: {location?.longitude}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum catálogo publicado encontrado.</p>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>Produtos</h2>
        {loading ? (
          <p>Carregando produtos...</p>
        ) : products.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                images={product.images}
                name={product.name}
                price={product.salePrice}
                discount={product.discountPrice}
                freeShipping={product.freeShipping}
              />
            ))}
          </div>
        ) : (
          <p>Nenhum produto disponível para entrega nesse endereço.</p>
        )}
      </div>
    </div>
  );
};

export default StoreSection;
