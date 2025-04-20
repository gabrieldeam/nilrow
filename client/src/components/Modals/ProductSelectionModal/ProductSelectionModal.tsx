'use client';

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation';
import CustomButton from "@/components/UI/CustomButton/CustomButton";
import ProductCard from "@/components/UI/ProductCard/ProductCard";
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from "@/components/UI/Card/Card";
import defaultImage from "../../../../public/assets/user.png";
import checkWhite from '../../../../public/assets/check-white.svg';
import verificacao from '../../../../public/assets/verificacao.svg';
import styles from "./ProductSelectionModal.module.css";

import { ProductDTO } from "@/types/services/product";
import { PagedResponse } from "@/types/services/common";
import {
  getProductsByCatalog,
  searchProductsByCatalog,
} from "@/services/product/productService";

interface Props {
  isOpen: boolean;
  catalogId: string;
  initiallySelectedIds?: string[];
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

const ProductSelectionModal: React.FC<Props> = ({
  catalogId: initialCatalogId,
  initiallySelectedIds = [],
  onClose,
  onConfirm,
}) => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const [catalogId, setCatalogId] = useState<string>(initialCatalogId);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [itemsPerPage, setItemsPerPage] = useState<number>(30);
  const [showOnlySelected, setShowOnlySelected] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initiallySelectedIds)
  );

  // Ao fechar ou confirmar, envia seleção ao pai
  const handleClose = useCallback(() => {
    onConfirm(Array.from(selectedIds));
    onClose();
  }, [onConfirm, onClose, selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Ajusta itens por breakpoint
  useEffect(() => {
    const updateItems = () => {
      const width = window.innerWidth;
      if (width <= 768) setItemsPerPage(10);
      else if (width <= 1024) setItemsPerPage(15);
      else setItemsPerPage(20);
    };
    updateItems();
    window.addEventListener('resize', updateItems);
    return () => window.removeEventListener('resize', updateItems);
  }, []);

  useEffect(() => { setPage(0); }, [itemsPerPage]);

  useEffect(() => {
    const stored = localStorage.getItem('selectedCatalogId');
    if (!stored) router.push('/channel/catalog/my/tools/coupon');
    else setCatalogId(stored);
  }, [router]);

  // Busca produtos
  useEffect(() => {
    if (!catalogId) return;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response: PagedResponse<ProductDTO>;
        if (searchTerm.trim()) {
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

  const handleToggleSelectedFilter = () => {
    setShowOnlySelected(prev => !prev);
  };

  const handlePreviousPage = () => { if (page > 0) setPage(page - 1); };
  const handleNextPage = () => { if (page < totalPages - 1) setPage(page + 1); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value);
  const handleSearchSubmit = () => setPage(0);

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.productPage}>
          {isMobile && (
            <MobileHeader
              title="Produto"
              showSearch
              searchPlaceholder="Pesquisar..."
              searchValue={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              buttons={{ close: true, filter: true }}
              onFilter={handleToggleSelectedFilter}
              handleBack={handleClose}
            />
          )}
          <div className={styles.productContainer}>
            <SubHeader
              title="Produto"
              handleBack={handleClose}
              showActiveFilterButton
              handleActiveFilter={handleToggleSelectedFilter}
              showSearch
              searchPlaceholder="Pesquisar..."
              searchValue={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
            />
            <Card title="Cadastrados" rightButton={{text: 'Confirmar', onClick: handleClose}}>            
              <div className={styles.productSeeDataWrapper}>
                <div className={styles.productSeeDatacontainer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(165px, 1fr))', gap: '5px' }}>
                  {loading && <p>Carregando produtos...</p>}
                  {!loading && products.filter(p => !showOnlySelected || selectedIds.has(p.id || '')).length === 0 && (
                    <p>Nenhum produto {showOnlySelected ? 'selecionado' : 'cadastrado'}.</p>
                  )}
                  {!loading && products.filter(p => !showOnlySelected || selectedIds.has(p.id || '')).map(product => {
                    const isSelected = selectedIds.has(product.id || '');
                    return (
                      <ProductCard
                        key={product.id}
                        images={product.images?.length ? product.images.map(img => `${apiUrl}${img}`) : [defaultImage.src]}
                        name={product.name}
                        price={product.salePrice}
                        discount={product.discountPrice || 0}
                        freeShipping={product.freeShipping}
                        buttons={[{ image: isSelected ? verificacao.src : checkWhite.src, onClick: () => product.id && toggleSelect(product.id) }]}
                      />
                    );
                  })}
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
      </div>
    </div>
  );
};

export default ProductSelectionModal;
