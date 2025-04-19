// app/components/Modals/ProductSelectionModal/ProductSelectionModal.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Modal from "../Modal/Modal";
import CustomInput from "@/components/UI/CustomInput/CustomInput";
import CustomButton from "@/components/UI/CustomButton/CustomButton";
import ProductCard from "@/components/UI/ProductCard/ProductCard";
import { ProductDTO } from "@/types/services/product";
import {
  getProductsByCatalog,
  searchProductsByCatalog,
} from "@/services/product/productService";

import defaultImage from "../../../../public/assets/user.png";
import verificacao from "../../../../public/assets/verificacao.svg";

import styles from "./ProductSelectionModal.module.css";

interface Props {
  isOpen: boolean;
  catalogId: string;
  initiallySelectedIds?: string[];
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
}

const ProductSelectionModal: React.FC<Props> = ({
  isOpen,
  catalogId,
  initiallySelectedIds = [],
  onClose,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(initiallySelectedIds)
  );

  // Busca produtos sempre que catalogId, searchTerm ou page mudam
  const fetch = useCallback(async () => {
    if (!catalogId) return;
    setLoading(true);
    try {
      const resp = searchTerm
        ? await searchProductsByCatalog(catalogId, searchTerm, page, itemsPerPage)
        : await getProductsByCatalog(catalogId, page, itemsPerPage);
      setProducts(resp.content);
      setTotalPages(resp.totalPages);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
    } finally {
      setLoading(false);
    }
  }, [catalogId, searchTerm, page, itemsPerPage]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3>Selecionar produtos</h3>

      {/* pesquisa */}
      <CustomInput
        title="Pesquisar"
        value={searchTerm}
        onChange={e => {
          setSearchTerm(e.target.value);
          setPage(0);
        }}
        placeholder="Nome ou SKU"
      />

      {/* lista de cards */}
      <div className={styles.grid}>
        {loading && <p>Carregando...</p>}
        {!loading && products.length === 0 && <p>Nenhum produto</p>}
        {!loading && products.map(p => {
          const imgUrl = p.images?.[0]
            ? `${process.env.NEXT_PUBLIC_API_URL}${p.images[0]}`
            : defaultImage.src;
          const isSel = p.id ? selectedIds.has(p.id) : false;
          return (
            <div
              key={p.id}
              onClick={() => p.id && toggleSelect(p.id)}
              className={`${styles.cardItem} ${isSel ? styles.selected : ""}`}
            >
              <ProductCard
                images={[imgUrl]}
                name={p.name}
                price={p.salePrice}
                discount={p.discountPrice || 0}
                freeShipping={p.freeShipping}
                buttons={[
                  { image: verificacao.src, onClick: () => p.id && toggleSelect(p.id) }
                ]}
              />
            </div>
          );
        })}
      </div>

      {/* paginação */}
      <div className={styles.pagination}>
        <CustomButton
          title="Anterior"
          onClick={page > 0 ? () => setPage(page - 1) : undefined}
          backgroundColor="#9F9F9F"
        />
        <span>{page + 1} / {totalPages}</span>
        <CustomButton
          title="Próximo"
          onClick={page < totalPages - 1 ? () => setPage(page + 1) : undefined}
          backgroundColor="#9F9F9F"
        />
      </div>

      {/* ações */}
      <div className={styles.actions}>
        <CustomButton title="Cancelar" onClick={onClose} backgroundColor="#777" />
        <span style={{ marginLeft: 8 }}>
          <CustomButton
            title={`Confirmar (${selectedIds.size})`}
            onClick={() => onConfirm(Array.from(selectedIds))}
            backgroundColor="#7B33E5"
          />
        </span>
      </div>
    </Modal>
  );
};

export default ProductSelectionModal;
