'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import ProductCard from '@/components/UI/ProductCard/ProductCard';

import editWhite from '../../../../../../public/assets/editWhite.svg';

import styles from './Product.module.css';

import { getProductsByCatalog } from '@/services/product/productService';
import { ProductDTO } from '@/types/services/product';
import defaultImage from '../../../../../../public/assets/user.png';

const Product: React.FC = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my');
  }, [router]);

  // Estados para armazenar o catalogId, os produtos e o loading
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Recupera o catalogId do localStorage. Se não existir, redireciona o usuário.
  useEffect(() => {
    const storedCatalogId = localStorage.getItem("selectedCatalogId");
    if (!storedCatalogId) {
      router.push('/channel/catalog/my');
    } else {
      setCatalogId(storedCatalogId);
    }
  }, [router]);

  // Busca os produtos assim que o catalogId estiver definido
  useEffect(() => {
    if (!catalogId) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await getProductsByCatalog(catalogId, 0, 10);
        // Supondo que a resposta tenha um campo "content" com os produtos
        setProducts(response.content);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [catalogId]);

  // Define o endereço base da API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Produto</title>
        <meta name="description" content="Visualize os dados detalhados do catálogo." />
      </Head>
      {isMobile && (
        <MobileHeader title="Produto" buttons={{ close: true }} handleBack={handleBack} />
      )}
      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <SubHeader title="Produto" handleBack={handleBack} />
        </div>
        <Card 
          title="Cadastrados"
          rightLink={{ href: "/channel/catalog/my/product/add", text: "+ Adicionar produto" }}
        >
          <div className={styles.productSeeDataWrapper}>
            <div className={styles.productSeeDatacontainer}>
              {loading && <p>Carregando produtos...</p>}
              {!loading && products.length === 0 && <p>Nenhum produto cadastrado.</p>}
              {!loading && products.map((product) => (
                <ProductCard
                  key={product.id}
                  images={
                    product.images && product.images.length > 0
                      ? product.images.map((img: any) => `${apiUrl}${img}`)
                      : [defaultImage.src]
                  }
                  name={product.name}
                  price={product.salePrice}
                  freeShipping={product.freeShipping}
                  buttons={[
                    { image: editWhite.src, link: `/channel/catalog/my/product/edit/${product.id}` }
                  ]}
                />
              ))}
            </div>            
          </div>  
        </Card>        
      </div>
    </div>
  );
};

export default Product;
