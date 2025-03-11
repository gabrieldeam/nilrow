import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import CustomButton from '@/components/UI/CustomButton/CustomButton';
import defaultImage from '../../../../public/assets/user.png';

import { listAllProductTemplates, searchProductTemplates } from '@/services/product/productTemplateService';
import { ProductTemplateDTO } from '@/types/services/productTemplate';
import { PagedResponse } from '@/types/services/common';
import { IModalTemplateProps } from "../../../types/components/Modals/ModalTemplate";

import styles from "./ModalTemplate.module.css";

const ModalTemplate: React.FC<IModalTemplateProps> = ({ isOpen, onClose, onSelectTemplate }) => {
  if (!isOpen) return null;

  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const [products, setProducts] = useState<ProductTemplateDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(30);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

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
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response: PagedResponse<ProductTemplateDTO>;
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
  }, [page, itemsPerPage, searchTerm]);

  const handlePreviousPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = () => {
    setPage(0);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>     

        <div className={styles.productPage}>
          {isMobile && (
            <MobileHeader
              title="Templates"
              showSearch={true}
              searchPlaceholder="Pesquisar..."
              searchValue={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              buttons={{ close: true }}
              handleBack={onClose}
            />
          )}

          <div className={styles.productContainer}>
            <SubHeader
              title="Templates"
              handleBack={onClose}
              showSearch={true}
              searchPlaceholder="Pesquisar..."
              searchValue={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />

            <Card title="Selecione um template">
              <div className={styles.productSeeDataWrapper}>
                <div className={styles.productSeeDatacontainer}>
                  {loading && <p>Carregando templates...</p>}
                  {!loading && products.length === 0 && <p>Nenhum template cadastrado.</p>}

                  {!loading && products.map(product => (
                    <div
                      key={product.id}
                      onClick={() => {
                        if (product.id) {
                          setSelectedTemplateId(product.id);
                          onSelectTemplate(product.id);
                          onClose();
                        }
                      }}
                      style={{
                        cursor: 'pointer',
                        border: selectedTemplateId === product.id ? '2px solid green' : 'none',
                        width: 'auto'           
                      }}
                    >
                      <ProductCard
                        images={
                          product.images?.length
                            ? product.images.map(img => `${apiUrl}${img}`)
                            : [defaultImage.src]
                        }
                        name={product.name}
                        hideFreeShipping={true}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.pagination}>
                <CustomButton
                  title="Anterior"
                  onClick={page === 0 ? undefined : handlePreviousPage}
                  backgroundColor="#9F9F9F"
                />
                <span>Página {page + 1} de {totalPages}</span>
                <CustomButton
                  title="Próximo"
                  onClick={page >= totalPages - 1 ? undefined : handleNextPage}
                  backgroundColor="#9F9F9F"
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTemplate;
