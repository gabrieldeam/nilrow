'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import CustomButton from '@/components/UI/CustomButton/CustomButton';

import editWhite from '../../../../../../public/assets/editWhite.svg';
import verificacao from '../../../../../../public/assets/verificacao.svg';
import checkWhite from '../../../../../../public/assets/check-white.svg';

import styles from './Product.module.css';

import { getProductsByCatalog, updateProduct, searchProductsByCatalog } from '@/services/product/productService';
import { ProductDTO } from '@/types/services/product';
import { PagedResponse } from '@/types/services/common';
import defaultImage from '../../../../../../public/assets/user.png';

const Product: React.FC = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(30);
  const [showOnlyActive, setShowOnlyActive] = useState<boolean>(false);

  // Estado para armazenar o termo de pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my');
  }, [router]);

  useEffect(() => {
    const updateItemsPerPage = () => {
      const width = window.innerWidth;
      if (width <= 768) setItemsPerPage(10);
      else if (width <= 1024) setItemsPerPage(15);
      else setItemsPerPage(20);
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  useEffect(() => setPage(0), [itemsPerPage]);

  useEffect(() => {
    const storedCatalogId = localStorage.getItem('selectedCatalogId');
    if (!storedCatalogId) router.push('/channel/catalog/my');
    else setCatalogId(storedCatalogId);
  }, [router]);

  useEffect(() => {
    if (!catalogId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response: PagedResponse<ProductDTO>;
        // Se houver termo de busca, usa o endpoint de pesquisa filtrado por catálogo
        if (searchTerm.trim() !== '') {
          response = await searchProductsByCatalog(catalogId, searchTerm, page, itemsPerPage);
        } else {
          response = await getProductsByCatalog(catalogId, page, itemsPerPage);
        }
        setProducts(response.content);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [catalogId, page, itemsPerPage, searchTerm]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const handleToggleActive = async (product: ProductDTO) => {
    try {
      const payload: ProductDTO = {
        ...product,
        active: !product.active,
        technicalSpecifications: product.technicalSpecifications || [],
        variations: product.variations || [],
      };

      const updatedProduct = await updateProduct(product.id as string, payload);

      setProducts(prevProducts =>
        prevProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p)),
      );
    } catch (error) {
      console.error('Erro ao atualizar o status do produto:', error);
    }
  };

  const handleToggleActiveFilter = () => {
    setShowOnlyActive(prev => !prev);
  };

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  // Função para atualizar o termo de pesquisa conforme o usuário digita
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Ao submeter a pesquisa, podemos resetar a paginação, por exemplo.
  const handleSearchSubmit = () => {
    setPage(0);
    // O useEffect detectará a mudança e fará a nova busca.
  };

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Produto</title>
        <meta name="description" content="Visualize os dados detalhados do catálogo." />
      </Head>
      {isMobile && (
        <MobileHeader
          title="Produto"
          showSearch={true}
          searchPlaceholder="Pesquisar..."
          searchValue={searchTerm}
          onSearchChange={handleSearchChange}
          onSearchSubmit={handleSearchSubmit}
          buttons={{ close: true, filter: true }}
          onFilter={handleToggleActiveFilter}
          handleBack={handleBack}
        />
      )}
      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <SubHeader
            title="Produto"
            handleBack={handleBack}
            showActiveFilterButton
            handleActiveFilter={handleToggleActiveFilter}
            showSearch={true}
            searchPlaceholder="Pesquisar..."
            searchValue={searchTerm}
            onSearchChange={handleSearchChange}
            onSearchSubmit={handleSearchSubmit}
          />
        </div>
        <Card title="Cadastrados" rightLink={{ href: "/channel/catalog/my/product/add", text: "+ Adicionar produto" }}>
          <div className={styles.productSeeDataWrapper}>
            <div className={styles.productSeeDatacontainer}
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', 
              gap: '5px' }}
            >
              {loading && <p>Carregando produtos...</p>}
              {!loading && products.filter(p => !showOnlyActive || p.active).length === 0 && (
                <p>Nenhum produto cadastrado.</p>
              )}
              {!loading && products.filter(p => !showOnlyActive || p.active).map(product => (
                <ProductCard
                  key={product.id}
                  images={product.images?.length ? product.images.map(img => `${apiUrl}${img}`) : [defaultImage.src]}
                  name={product.name}
                  price={product.salePrice}
                  discount={product.discountPrice || 0}
                  freeShipping={product.freeShipping}
                  buttons={[
                    { image: editWhite.src, link: `/channel/catalog/my/product/edit?productId=${product.id}` },
                    { image: product.active ? verificacao.src : checkWhite.src, onClick: () => handleToggleActive(product) },
                  ]}
                />
              ))}
            </div>
          </div>
          <div className={styles.pagination}>
            <CustomButton title="Anterior" onClick={page === 0 ? undefined : handlePreviousPage} backgroundColor="#9F9F9F" />
            <span>Página {page + 1} de {totalPages}</span>
            <CustomButton title="Próximo" onClick={page >= totalPages - 1 ? undefined : handleNextPage} backgroundColor="#9F9F9F" />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Product;
