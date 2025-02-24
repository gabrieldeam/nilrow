'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import CustomSelect from '@/components/UI/CustomSelect/CustomSelect';
import StageButton from '@/components/UI/StageButton/StageButton';
import Card from '@/components/UI/Card/Card';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';

import { createProduct } from '@/services/product/productService';
import { ProductDTO, ProductType, ProductCondition, ProductionType } from '@/types/services/product';

import defaultImage from '../../../../../../../public/assets/user.png';
import styles from './addProduct.module.css';

const ProductCreatePage: React.FC = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const [imagePreview, setImagePreview] = useState<string>(defaultImage.src);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // Campos do ProductDTO
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.PRODUCT);
  const [condition, setCondition] = useState<ProductCondition>(ProductCondition.NEW);
  const [productionType, setProductionType] = useState<ProductionType>(ProductionType.OWN);
  const [freeShipping, setFreeShipping] = useState(false);

  const [netWeight, setNetWeight] = useState<number>(0);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  // Exemplo IDs
  const [catalogId, setCatalogId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // Opções de select
  const catalogOptions = [
    { value: 'CATALOG_1', label: 'Meu Catálogo 1' },
    { value: 'CATALOG_2', label: 'Meu Catálogo 2' },
  ];
  const categoryOptions = [
    { value: 'CAT_1', label: 'Categoria 1' },
    { value: 'CAT_2', label: 'Categoria 2' },
  ];
  const subCategoryOptions = [
    { value: 'SUB_1', label: 'SubCategoria 1' },
    { value: 'SUB_2', label: 'SubCategoria 2' },
  ];
  const brandOptions = [
    { value: 'BRAND_1', label: 'Marca 1' },
    { value: 'BRAND_2', label: 'Marca 2' },
  ];

  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my/product');
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 0) {
        setImageFiles(filesArray);
        setImagePreview(URL.createObjectURL(filesArray[0]));
      }
    }
  };

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    console.log('Enviando form com dados do produto...');

    // Monta o objeto ProductDTO
    const newProduct: ProductDTO = {
      id: '',
      catalogId,
      images: [],
      name,
      skuCode,
      salePrice,
      discountPrice,
      unitOfMeasure,
      type,
      condition,
      categoryId,
      subCategoryId,
      brandId,
      productionType,
      expirationDate: null,    // ou '' se preferir
      freeShipping,
      netWeight,
      grossWeight,
      width,
      height,
      depth,
      volumes: 0,
      itemsPerBox: 0,
      gtinEan: '',
      gtinEanTax: '',
      shortDescription: '',
      complementaryDescription: '',
      notes: '',
      stock,
      active: true,
      associated: [],
    };

    try {
      const created = await createProduct(newProduct, imageFiles);
      console.log('Produto criado com sucesso', created);
      router.push('/channel/catalog/my/product');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      alert('Ocorreu um erro ao criar o produto!');
    }
  }, [
    catalogId, name, skuCode, salePrice, discountPrice, unitOfMeasure, type, condition,
    categoryId, subCategoryId, brandId, productionType, freeShipping,
    netWeight, grossWeight, width, height, depth, stock,
    imageFiles, router
  ]);

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Produto</title>
        <meta name="description" content="Criação de Produto" />
      </Head>

      {isMobile && (
        <MobileHeader title="Produto" buttons={{ close: true }} handleBack={handleBack} />
      )}

      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <SubHeader title="Novo Produto" handleBack={handleBack} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Imagem principal */}
          <div className={styles.addChannelImageUpload}>
            {imagePreview && (
              <Image
                src={imagePreview}
                alt="Preview"
                className={styles.addChannelImagePreview}
                width={70}
                height={70}
              />
            )}
            <div className={styles.addChannelUploadSection}>
              <label htmlFor="channel-image" className={styles.addChannelUploadButton}>
                Escolher arquivo
              </label>
              <input
                type="file"
                id="channel-image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              {imageFiles.length > 0 && (
                <div className={styles.fileName}>
                  {imageFiles[0].name}
                </div>
              )}
            </div>
          </div>

          {/* Dados Básicos */}
          <Card title="Dados Básicos">
            <CustomSelect
              title="Catálogo"
              placeholder="Selecione um catálogo"
              value={catalogId}
              name="catalog"
              onChange={(e) => setCatalogId(e.target.value)}
              options={catalogOptions}
            />

            <CustomSelect
              title="Categoria"
              placeholder="Selecione uma categoria"
              value={categoryId}
              name="category"
              onChange={(e) => setCategoryId(e.target.value)}
              options={categoryOptions}
            />

            <CustomSelect
              title="SubCategoria"
              placeholder="Selecione uma subcategoria"
              value={subCategoryId}
              name="subcategory"
              onChange={(e) => setSubCategoryId(e.target.value)}
              options={subCategoryOptions}
            />

            <CustomSelect
              title="Marca"
              placeholder="Selecione uma marca"
              value={brandId}
              name="brand"
              onChange={(e) => setBrandId(e.target.value)}
              options={brandOptions}
            />

            <CustomInput
              title="Nome do Produto"
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <CustomInput
              title="SKU"
              type="text"
              name="skuCode"
              value={skuCode}
              onChange={(e) => setSkuCode(e.target.value)}
            />
            <CustomInput
              title="Preço de Venda"
              type="number"
              name="salePrice"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
            />
            <CustomInput
              title="Preço de Desconto"
              type="number"
              name="discountPrice"
              value={discountPrice}
              onChange={(e) => setDiscountPrice(Number(e.target.value))}
            />
            <CustomInput
              title="Unidade de Medida"
              type="text"
              name="unitOfMeasure"
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value)}
            />

            {/* Tipo de Produto */}
            <CustomSelect
              title="Tipo de Produto"
              placeholder="Selecione o tipo"
              value={type}
              onChange={(e) => setType(e.target.value as ProductType)}
              options={[
                { value: ProductType.PRODUCT, label: 'Produto' },
                { value: ProductType.SERVICE, label: 'Serviço' },
              ]}
            />

            {/* Condição */}
            <CustomSelect
              title="Condição"
              placeholder="Selecione a condição"
              value={condition}
              name="condition"
              onChange={(e) => setCondition(e.target.value as ProductCondition)}
              options={[
                { value: ProductCondition.NEW, label: 'Novo' },
                { value: ProductCondition.USED, label: 'Usado' },
                { value: ProductCondition.REFURBISHED, label: 'Recondicionado' },
              ]}
            />

            {/* Tipo de Produção */}
            <CustomSelect
              title="Tipo de Produção"
              placeholder="Selecione o tipo"
              value={productionType}
              name="productionType"
              onChange={(e) => setProductionType(e.target.value as ProductionType)}
              options={[
                { value: ProductionType.OWN, label: 'Própria' },
                { value: ProductionType.THIRD_PARTY, label: 'Terceiros' },
              ]}
            />

            {/* Frete Grátis */}
            {/* Se 'CustomInput' não suporta 'checked' direto, use 'checkbox' prop ou extenda */}
            <div style={{ marginTop: '10px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                />
                Frete Grátis
              </label>
            </div>
          </Card>

          {/* Características */}
          <ExpandableCard title="Características" subtitle="Opcional" defaultExpanded={false}>
            <CustomInput
              title="Peso Líquido"
              type="number"
              name="netWeight"
              value={netWeight}
              onChange={(e) => setNetWeight(Number(e.target.value))}
            />
            <CustomInput
              title="Peso Bruto"
              type="number"
              name="grossWeight"
              value={grossWeight}
              onChange={(e) => setGrossWeight(Number(e.target.value))}
            />
            <CustomInput
              title="Largura"
              type="number"
              name="width"
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
            <CustomInput
              title="Altura"
              type="number"
              name="height"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
            />
            <CustomInput
              title="Profundidade"
              type="number"
              name="depth"
              value={depth}
              onChange={(e) => setDepth(Number(e.target.value))}
            />
          </ExpandableCard>

          {/* Estoque */}
          <ExpandableCard title="Estoque" subtitle="Opcional" defaultExpanded={false}>
            <CustomInput
              title="Quantidade em Estoque"
              type="number"
              name="stock"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </ExpandableCard>

          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Criar" backgroundColor="#7B33E5" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;
