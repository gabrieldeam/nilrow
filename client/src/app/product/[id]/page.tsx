'use client';

import React, { use, useEffect, useState } from 'react';
import { useLocationContext } from '@/context/LocationContext';
import { getProductByIdWithDelivery } from '@/services/product/productService';
import { getDeliveryPrice } from '@/services/deliveryService';
import { ProductDTO } from '@/types/services/product';
import { DeliveryPriceDTO } from '@/types/services/delivery';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

const ProductPage: React.FC<ProductPageProps> = ({ params }) => {
  // Desembrulha a promise para obter os parâmetros
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const { location } = useLocationContext();
  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryPriceDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (location) {
      setLoading(true);
      // Busca o produto, que já traz informações do delivery
      getProductByIdWithDelivery(id, location.latitude, location.longitude)
        .then((data) => {
          setProduct(data);
        })
        .catch((err) => {
          console.error(err);
          setError('Erro ao carregar o produto.');
        })
        .finally(() => setLoading(false));
    }
  }, [id, location]);

  // Depois que o produto for carregado e se houver localização, busca o preço do delivery e tempo médio
  useEffect(() => {
    if (product && location) {
      getDeliveryPrice(product.catalogId, location.latitude, location.longitude)
        .then((data) => {
          setDeliveryData(data);
        })
        .catch((err) => {
          console.error(err);
          setDeliveryData(null);
        });
    }
  }, [product, location]);

  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Nenhum produto encontrado.</p>;

  return (
    <div style={{ padding: '10rem' }}>
      <h1>Detalhes do Produto</h1>
      <ul>
        <li><strong>ID:</strong> {product.id}</li>
        <li><strong>Catalog ID:</strong> {product.catalogId}</li>
        <li><strong>Nome:</strong> {product.name}</li>
        <li><strong>SKU:</strong> {product.skuCode}</li>
        <li><strong>Preço de Venda:</strong> {product.salePrice}</li>
        <li><strong>Preço com Desconto:</strong> {product.discountPrice}</li>
        <li><strong>Unidade de Medida:</strong> {product.unitOfMeasure}</li>
        <li><strong>Tipo:</strong> {product.type}</li>
        <li><strong>Condição:</strong> {product.condition}</li>
        <li><strong>Categoria ID:</strong> {product.categoryId}</li>
        <li><strong>Subcategoria ID:</strong> {product.subCategoryId}</li>
        <li><strong>Marca ID:</strong> {product.brandId}</li>
        <li><strong>Tipo de Produção:</strong> {product.productionType}</li>
        <li><strong>Data de Validade:</strong> {product.expirationDate || 'N/A'}</li>
        <li><strong>Frete Grátis:</strong> {product.freeShipping ? 'Sim' : 'Não'}</li>
        <li><strong>Peso Líquido:</strong> {product.netWeight}</li>
        <li><strong>Peso Bruto:</strong> {product.grossWeight}</li>
        <li>
          <strong>Dimensões (L x A x P):</strong> {product.width} x {product.height} x {product.depth}
        </li>
        <li><strong>Volumes:</strong> {product.volumes}</li>
        <li><strong>Itens por Caixa:</strong> {product.itemsPerBox}</li>
        <li><strong>GTIN/EAN:</strong> {product.gtinEan}</li>
        <li><strong>GTIN/EAN Tax:</strong> {product.gtinEanTax}</li>
        <li><strong>Descrição Curta:</strong> {product.shortDescription}</li>
        <li><strong>Descrição Complementar:</strong> {product.complementaryDescription}</li>
        <li><strong>Notas:</strong> {product.notes}</li>
        <li><strong>Estoque:</strong> {product.stock}</li>
        <li><strong>Ativo:</strong> {product.active ? 'Sim' : 'Não'}</li>
        <li><strong>Mensagem de Entrega:</strong> {product.deliveryMessage}</li>
        <li>
          <strong>Preço de Delivery:</strong> {deliveryData ? deliveryData.price : 'N/A'}
        </li>
        <li>
          <strong>Tempo Médio de Entrega:</strong> {deliveryData ? `${deliveryData.averageDeliveryTime} min` : 'N/A'}
        </li>
      </ul>

      {/* Exibindo a Ficha Técnica */}
      <h2>Ficha Técnica</h2>
      {product.technicalSpecifications && product.technicalSpecifications.length > 0 ? (
        <ul>
          {product.technicalSpecifications.map((tech, index) => (
            <li key={index}>
              <strong>{tech.title}</strong>: {tech.content}
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem especificações técnicas</p>
      )}

      {/* Exibindo as Variações */}
      <h2>Variações</h2>
      {product.variations && product.variations.length > 0 ? (
        <ul>
          {product.variations.map((variation, index) => (
            <li key={index}>
              <strong>{variation.name}</strong> - Preço: {variation.price} - Desconto: {variation.discountPrice}
              <br />
              <span>Atributos:</span>
              {variation.attributes && variation.attributes.length > 0 ? (
                <ul>
                  {variation.attributes.map((attr, idx) => (
                    <li key={idx}>
                      {attr.attributeName}: {attr.attributeValue}
                    </li>
                  ))}
                </ul>
              ) : (
                <span> Nenhum atributo</span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Sem variações</p>
      )}
    </div>
  );
};

export default ProductPage;
