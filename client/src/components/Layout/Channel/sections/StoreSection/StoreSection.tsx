"use client";

import React, { FC, useEffect, useState } from 'react';
import Link from 'next/link';
import SubButton from '../../../../UI/SubButton/SubButton';
import CustomButton from '../../../../UI/CustomButton/CustomButton';
import categoriesIcon from '../../../../../../public/assets/categories.svg';
import searchIcon from '../../../../../../public/assets/search.svg';
import storeImage from '../../../../../../public/assets/store.svg';
import storeSectionStyles from './storeSection.module.css';
import { useLocationContext } from '@/context/LocationContext';
import { filterProductsByCatalogAndDelivery } from '@/services/product/productService';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import { ProductDTO } from '@/types/services/product';
import defaultImage from '../../../../../../public/assets/user.png';

interface Catalog {
  id: string;
  name: string;
}

interface StoreSectionProps {
  isMobile: boolean;
  handleSearchClick: () => void;
  catalogs: Catalog[];  
  nickname: string;
}

const StoreSection: FC<StoreSectionProps> = ({ isMobile, handleSearchClick, catalogs, nickname  }) => {
  const { location } = useLocationContext();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const pageSize = 30; // Exibe 30 produtos por página
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // Estados para gerenciar o catálogo selecionado e os catálogos que possuem produtos
  const [selectedCatalog, setSelectedCatalog] = useState<Catalog | null>(null);
  const [validCatalogs, setValidCatalogs] = useState<Catalog[]>([]);

  // Efeito para validar cada catálogo: chama o endpoint com page 0 e verifica se há produtos
  useEffect(() => {
    if (location && catalogs.length > 0) {
      Promise.all(
        catalogs.map((catalog) =>
          filterProductsByCatalogAndDelivery(
            catalog.id,
            location.latitude,
            location.longitude,
            0,
            pageSize
          )
            .then((response) => {
              return { catalog, hasProducts: response.content && response.content.length > 0 };
            })
            .catch((error) => {
              console.error(`Erro ao validar catálogo ${catalog.id}:`, error);
              return { catalog, hasProducts: false };
            })
        )
      ).then((results) => {
        const valid = results.filter((result) => result.hasProducts).map((result) => result.catalog);
        setValidCatalogs(valid);
        // Se houver pelo menos um catálogo válido, define o primeiro como padrão
        if (valid.length > 0) {
          setSelectedCatalog(valid[0]);
        }
      });
    }
  }, [location, catalogs, pageSize]);

  // Efeito para buscar produtos com base no catálogo selecionado, página e localização
  useEffect(() => {
    if (location && selectedCatalog) {
      setLoading(true);
      filterProductsByCatalogAndDelivery(
        selectedCatalog.id,
        location.latitude,
        location.longitude,
        page,
        pageSize
      )
        .then((pagedResponse) => {
          setProducts(pagedResponse.content);
          setTotalPages(pagedResponse.totalPages);
        })
        .catch((error) => {
          console.error(`Erro ao buscar produtos do catálogo ${selectedCatalog.id}:`, error);
        })
        .finally(() => setLoading(false));
    }
  }, [location, selectedCatalog, page, pageSize]);

  const handlePreviousPage = () => {
    if (page > 0) setPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage((prev) => prev + 1);
  };

  return (
    <div className={storeSectionStyles.container}>
       {isMobile && (
        <div className={storeSectionStyles.subButtonsContainer}>
          <SubButton text="Categorias" backgroundColor="#212121" imageSrc={categoriesIcon} />
          <SubButton text="Pesquisar" backgroundColor="#212121" imageSrc={searchIcon} onClick={handleSearchClick} />
        </div>
      )}

      {/* Caso não seja mobile e queira exibir os botões de catálogo na versão desktop */}
      <div className={storeSectionStyles.subButtonsContainerCatalog}>
        {validCatalogs.map((catalog) => (
          <SubButton
            key={catalog.id}
            text={`${catalog.name}`}
            backgroundColor="#212121"
            imageSrc={storeImage}
            onClick={() => {
              setSelectedCatalog(catalog);
              setPage(0);
            }}
          />
        ))}          
      </div>      

      {/* Se houver apenas um catálogo válido, não exibe o botão – já usamos o primeiro por padrão */}
      {loading ? (
        <p>Carregando produtos...</p>
      ) : products.length > 0 ? (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))',
              gap: '5px',
            }}
          >
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}?nickname=${nickname}`} style={{ textDecoration: 'none' }}>
                  <ProductCard
                  key={product.id}
                  images={
                    product.images?.length
                      ? product.images.map((img) => `${apiUrl}${img}`)
                      : [defaultImage.src]
                  }
                  name={product.name}
                  price={product.salePrice}
                  discount={product.discountPrice}
                  freeShipping={product.freeShipping}
                />
              </Link>
              
            ))}
          </div>
          {totalPages > 1 && (
            <div className={storeSectionStyles.pagination}>
              <CustomButton
                title="Anterior"
                onClick={page === 0 ? undefined : handlePreviousPage}
                backgroundColor="#9F9F9F"
              />
              <span>
                Página {page + 1} de {totalPages}
              </span>
              <CustomButton
                title="Próximo"
                onClick={page >= totalPages - 1 ? undefined : handleNextPage}
                backgroundColor="#9F9F9F"
              />
            </div>
          )}
        </>
      ) : (
        <p>Nenhum produto disponível para entrega nesse endereço.</p>
      )}
    </div>
  );
};

export default StoreSection;
