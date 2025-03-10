'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import CustomButton from '@/components/UI/CustomButton/CustomButton';

import editWhite from '../../../../public/assets/editWhite.svg';

import styles from './Product.module.css';

import { listAllProductTemplates, searchProductTemplates } from '@/services/product/productTemplateService';
import { ProductTemplateDTO } from '@/types/services/productTemplate';
import { PagedResponse } from '@/types/services/common';
import defaultImage from '../../../../public/assets/user.png';

const Product: React.FC = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductTemplateDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(30);
  const [showOnlyActive, setShowOnlyActive] = useState<boolean>(false);

  // Estado para armazenar o termo de pesquisa
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleBack = useCallback(() => {
    router.push('/admin');
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
    if (!storedCatalogId) router.push('/admin');
    else setCatalogId(storedCatalogId);
  }, [router]);

  useEffect(() => {
    if (!catalogId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response: PagedResponse<ProductTemplateDTO>;
        // Se houver termo de busca, usa o endpoint de pesquisa filtrado por catálogo
        if (searchTerm.trim() !== '') {
          response = await searchProductTemplates(searchTerm, page, itemsPerPage);
        } else {
          response = await listAllProductTemplates(page, itemsPerPage);
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
        <Card title="Cadastrados" rightLink={{ href: "/admin/template/add", text: "+ Adicionar produto" }}>
          <div className={styles.productSeeDataWrapper}>
            <div className={styles.productSeeDatacontainer}>
              {loading && <p>Carregando produtos...</p>}
              {!loading && products.filter(p => !showOnlyActive ).length === 0 && (
                <p>Nenhum tamplate cadastrado.</p>
              )}
              {!loading && products.filter(p => !showOnlyActive).map(product => (
                <ProductCard
                  key={product.id}
                  images={product.images?.length ? product.images.map(img => `${apiUrl}${img}`) : [defaultImage.src]}
                  name={product.name}                  
                  buttons={[
                    { image: editWhite.src, link: `/admin/template/edit?productId=${product.id}` },                    
                  ]}
                  hideFreeShipping={true}
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
