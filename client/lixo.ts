'use client';

import React, { useState, useCallback, useEffect } from 'react';
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
import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';
import trashIcon from '../../../../../../../public/assets/trash.svg';

import { createProduct } from '@/services/product/productService';
import { getAllCategoriesAdmin, getSubCategoriesByCategory } from '@/services/categoryService';
import { getAllBrands } from '@/services/product/brandService';

import { ProductDTO, ProductType, ProductCondition, ProductionType } from '@/types/services/product';
import { ImageData, AssociatedProductInput } from '@/types/pages/channel/catalog/my/product/add';

import { useNotification } from '@/hooks/useNotification';

import defaultImage from '../../../../../../../public/assets/user.png';
import styles from './AddProduct.module.css';

const ProductCreatePage: React.FC = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { setMessage } = useNotification();

  // Estado para imagens do produto principal
  const [images, setImages] = useState<ImageData[]>([]);

  // Estados dos campos básicos do produto principal
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.PRODUCT);
  const [condition, setCondition] = useState<ProductCondition>(
    ProductCondition.NEW
  );
  const [productionType, setProductionType] = useState<ProductionType>(
    ProductionType.OWN
  );
  const [freeShipping, setFreeShipping] = useState(false);

  // Estados de dimensões e estoque
  const [netWeight, setNetWeight] = useState<number>(0);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [depth, setDepth] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  // Estados dos campos adicionais do produto principal
  const [shortDescription, setShortDescription] = useState('');
  const [complementaryDescription, setComplementaryDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [volumes, setVolumes] = useState<number>(0);
  const [itemsPerBox, setItemsPerBox] = useState<number>(0);
  const [gtinEan, setGtinEan] = useState('');
  const [gtinEanTax, setGtinEanTax] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // IDs de exemplo (catalog, categoria, sub, brand)
  const [catalogId, setCatalogId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // Categoria, SubCategoria e Marcas
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(true);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);
  const [categoryPage, setCategoryPage] = useState(0);
  const [subCategoryPage, setSubCategoryPage] = useState(0);
  const [brandPage, setBrandPage] = useState(0);

  // Estado para os produtos associados
  const [associations, setAssociations] = useState<AssociatedProductInput[]>(
    []
  );

  useEffect(() => {
    async function fetchInitialData() {
      try {
        const cats = await getAllCategoriesAdmin(0, 10);
        setCategories(cats.content);
        setHasMoreCategories(!cats.last);
  
        const brs = await getAllBrands(0, 10);
        setBrands(brs.content);
        setHasMoreBrands(!brs.last);
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error);
      }
    }
    fetchInitialData();
  }, []);
  
  async function fetchSubCategories(catId: string, page = 0) {
    try {
      const subCats = await getSubCategoriesByCategory(catId, page, 10);
      if (page === 0) {
        setSubCategories(subCats.content);
      } else {
        setSubCategories((prev) => [...prev, ...subCats.content]);
      }
      setHasMoreSubCategories(!subCats.last);
      setSubCategoryPage(page);
    } catch (error) {
      console.error('Erro ao buscar subcategorias:', error);
    }
  }

  // --- Funções para upload e remoção de imagens do produto principal ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const availableSlots = 5 - images.length;

      if (newFiles.length > availableSlots) {
        setMessage('Você pode enviar no máximo 5 imagens.', 'error');
        newFiles.splice(availableSlots);
      }

      const newImages = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(index, 1);
      URL.revokeObjectURL(removed.preview); // Libera memória do objeto URL
      return newImages;
    });
  };

  // --- Funções para manipular produtos associados ---

  const handleAddAssociation = () => {
    const newAssoc: AssociatedProductInput = {
      catalogId,
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
      expirationDate,
      freeShipping,
      netWeight,
      grossWeight,
      width,
      height,
      depth,
      volumes,
      itemsPerBox,
      gtinEan,
      gtinEanTax,
      shortDescription,
      complementaryDescription,
      notes,
      stock,
      active: true,
      uploadedImages: [],
      isRemoved: false,
      images: [],
    };
    setAssociations((prev) => [...prev, newAssoc]);
  };

  const updateAssociationField = (
    index: number,
    field: keyof AssociatedProductInput,
    value: any
  ) => {
    setAssociations((prev) => {
      const newArr = [...prev];
      newArr[index] = { ...newArr[index], [field]: value };
      return newArr;
    });
  };

  // Remove um associado (se já existir no BD, marca para remoção; caso contrário, remove do array)
  const removeAssociation = (index: number) => {
    setAssociations((prev) => {
      const newArr = [...prev];
      if (newArr[index].id) {
        newArr[index].isRemoved = true;
      } else {
        newArr.splice(index, 1);
      }
      return newArr;
    });
  };

  // Lida com upload de imagens para um produto associado
  const handleAssociationImagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    assocIndex: number
  ) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      setAssociations((prev) => {
        const newArr = [...prev];
        const assocItem = { ...newArr[assocIndex] };
        const currentCount = assocItem.uploadedImages ? assocItem.uploadedImages.length : 0;
        const availableSlots = 5 - currentCount;
        
        if (newFiles.length > availableSlots) {
          setMessage('Você pode enviar no máximo 5 imagens.', 'error');
          newFiles.splice(availableSlots);
        }
  
        const filesArray = newFiles.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));
  
        assocItem.uploadedImages = [
          ...(assocItem.uploadedImages || []),
          ...filesArray,
        ];
  
        newArr[assocIndex] = assocItem;
        return newArr;
      });
  
      // Resetar o valor para permitir nova seleção do mesmo arquivo, se necessário
      e.target.value = '';
    }
  };
  

  // Remove imagem específica de um produto associado
  const handleRemoveAssocImage = (assocIndex: number, imgIndex: number) => {
    setAssociations((prev) => {
      const newArr = [...prev];
      const assocItem = { ...newArr[assocIndex] };

      if (assocItem.uploadedImages) {
        const updatedImages = [...assocItem.uploadedImages];
        const [removed] = updatedImages.splice(imgIndex, 1);
        URL.revokeObjectURL(removed.preview);
        assocItem.uploadedImages = updatedImages;
      }
      newArr[assocIndex] = assocItem;
      return newArr;
    });
  };

  // --- Função de envio do formulário ---
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      console.log('Enviando form com dados do produto...');

      // Monta o objeto do produto principal
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
        expirationDate,
        freeShipping,
        netWeight,
        grossWeight,
        width,
        height,
        depth,
        volumes,
        itemsPerBox,
        gtinEan,
        gtinEanTax,
        shortDescription,
        complementaryDescription,
        notes,
        stock,
        active: true,
        associated: [],
      };

      try {
        // 1. Cria o produto principal
        const createdMain = await createProduct(
          newProduct,
          images.map((img) => img.file)
        );
        console.log('Produto principal criado', createdMain);

        // 2. Cria os produtos associados (se houver)
        const associatedIds: string[] = [];
        for (const assoc of associations) {
          if (assoc.isRemoved) continue;

          const assocPayload: ProductDTO = {
            id: '',
            catalogId: assoc.catalogId,
            images: [],
            name: assoc.name,
            skuCode: assoc.skuCode,
            salePrice: assoc.salePrice,
            discountPrice: assoc.discountPrice,
            unitOfMeasure: assoc.unitOfMeasure,
            type: assoc.type,
            condition: assoc.condition,
            categoryId: assoc.categoryId,
            subCategoryId: assoc.subCategoryId,
            brandId: assoc.brandId,
            productionType: assoc.productionType,
            expirationDate: null,
            freeShipping: assoc.freeShipping,
            netWeight: assoc.netWeight,
            grossWeight: assoc.grossWeight,
            width: assoc.width,
            height: assoc.height,
            depth: assoc.depth,
            volumes: assoc.volumes,
            itemsPerBox: assoc.itemsPerBox,
            gtinEan: assoc.gtinEan,
            gtinEanTax: assoc.gtinEanTax,
            shortDescription: assoc.shortDescription,
            complementaryDescription: assoc.complementaryDescription,
            notes: assoc.notes,
            stock: assoc.stock,
            active: assoc.active,
            associated: [],
          };

          const createdAssoc = await createProduct(
            assocPayload,
            assoc.uploadedImages?.map((u) => u.file) || []
          );
          console.log('Produto associado criado', createdAssoc);
          associatedIds.push(createdAssoc.id);
        }

        // 3. (Opcional) Atualiza o produto principal com os IDs dos associados, se precisar
        // Por exemplo, se tiver a função updateProduct:
        // await updateProduct(createdMain.id, { ...createdMain, associated: associatedIds });

        console.log('IDs dos produtos associados:', associatedIds);

        // Redireciona após criar tudo
        router.push('/channel/catalog/my/product');
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        setMessage('Ocorreu um erro ao criar o produto!', 'error');
      }
    },
    [
      catalogId,
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
      freeShipping,
      netWeight,
      grossWeight,
      width,
      height,
      depth,
      volumes,
      itemsPerBox,
      gtinEan,
      gtinEanTax,
      shortDescription,
      complementaryDescription,
      notes,
      stock,
      images,
      associations,
      router,
    ]
  );

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>,
    index?: number, // Para associações
    field?: keyof AssociatedProductInput // Para associações
  ) => {
    const { name, value } = e.target;
    let maxLength = 0;
  
    if (name === 'name' || name.includes('assoc-name')) {
      maxLength = 150;
    } else if (name.includes('shortDescription')) {
      maxLength = 255;
    } else if (name.includes('complementaryDescription')) {
      maxLength = 2000;
    } else if (name.includes('notes')) {
      maxLength = 2000;
    }
  
    if (value.length > maxLength) return;
  
    if (typeof index === 'number' && field) {
      updateAssociationField(index, field, value);
    } else {
      if (name === 'name') setName(value);
      if (name === 'shortDescription') setShortDescription(value);
      if (name === 'complementaryDescription') setComplementaryDescription(value);
      if (name === 'notes') setNotes(value);
    }
  };
  

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Produto</title>
        <meta name="description" content="Criação de Produto" />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Produto"
          buttons={{ close: true }}
          handleBack={() => router.push('/channel/catalog/my/product')}
        />
      )}

      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <SubHeader
            title="Novo Produto"
            handleBack={() => router.push('/channel/catalog/my/product')}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Upload de Imagens do Produto Principal */}
          <div className={styles.addChannelImageUpload}>
            {images.length > 0 ? (
              images.map((image, index) => (
                <div key={index} className={styles.imageContainer}>
                  <Image
                    src={image.preview}
                    alt={`Preview ${index}`}
                    className={styles.addChannelImagePreview}
                    width={70}
                    height={70}
                  />
                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => handleRemoveImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <Image
                src={defaultImage.src}
                alt="Preview"
                className={styles.addChannelImagePreview}
                width={70}
                height={70}
              />
            )}

            <div className={styles.addChannelUploadSection}>
              <label
                htmlFor="channel-image"
                className={styles.addChannelUploadButton}
              >
                + Adicionar Imagem
              </label>
              <input
                type="file"
                id="channel-image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              {/* {images.length > 0 && (
                <div className={styles.fileName}>
                  {images.map((img, index) => (
                    <div key={index}>{img.file.name}</div>
                  ))}
                </div>
              )} */}
            </div>
          </div>

          {/* Dados Básicos */}
          <Card title="Dados Básicos">
            <CustomInput
              title="Nome"
              type="text"
              name="name"
              value={name}
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${150 - name.length}`}
            />
            <div className={styles.flexFormInput}>
              <CustomInput
                title="Preço"
                type="number"
                name="salePrice"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
              />
              <CustomInput
                title="Desconto"
                type="number"
                name="discountPrice"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
              />
              <CustomInput
                title="Estoque"
                type="number"
                name="stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>            
            <div className={styles.flexFormInput}>
              <CustomInput
                title="SKU"
                type="text"
                name="skuCode"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                bottomLeftText="Referência do produto"
              />
              <CustomInput
                title="Unidade"
                type="text"
                name="unitOfMeasure"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                bottomLeftText="Ex: un, kg, etc..."
              />
            </div>

            <div className={styles.flexFormInput}>
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
              <CustomSelect
                title="Condição"
                placeholder="Selecione a condição"
                value={condition}
                name="condition"
                onChange={(e) =>
                  setCondition(e.target.value as ProductCondition)
                }
                options={[
                  { value: ProductCondition.NEW, label: 'Novo' },
                  { value: ProductCondition.USED, label: 'Usado' },
                  { value: ProductCondition.REFURBISHED, label: 'Recondicionado' },
                ]}
              />
            </div>
            
          </Card>

          {/* Sobre */}
          <ExpandableCard title="Sobre" defaultExpanded={false}>
            <CustomInput
              title="Descrição Curta"
              type="text"
              name="shortDescription"
              value={shortDescription}
              isTextarea
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${255 - shortDescription.length}`}
            />

            <CustomInput
              title="Descrição Complementar"
              type="text"
              name="complementaryDescription"
              value={complementaryDescription}
              isTextarea
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${2000 - complementaryDescription.length}`}
            />

            <CustomInput
              title="Notas"
              type="text"
              name="notes"
              value={notes}
              isTextarea
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${2000 - notes.length}`}
            />
          </ExpandableCard>

          {/* Características */}
          <ExpandableCard title="Características" defaultExpanded={false}>
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Marca"
                placeholder="Selecione"
                value={brandId}
                name="brand"
                onChange={(e) => setBrandId(e.target.value)}
                options={brands.map((b: any) => ({ value: b.id, label: b.name }))}
                onLoadMore={() => {
                  const nextPage = brandPage + 1;
                  getAllBrands(nextPage, 10).then((brs) => {
                    setBrands((prev) => [...prev, ...brs.content]);
                    setHasMoreBrands(!brs.last);
                    setBrandPage(nextPage);
                  });
                }}
                hasMore={hasMoreBrands}
              />

              <CustomSelect
                title="Tipo de Produção"
                placeholder="Selecione o tipo"
                value={productionType}
                name="productionType"
                onChange={(e) =>
                  setProductionType(e.target.value as ProductionType)
                }
                options={[
                  { value: ProductionType.OWN, label: 'Própria' },
                  { value: ProductionType.THIRD_PARTY, label: 'Terceiros' },
                ]}
              />
            </div>            
            
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Categoria"
                placeholder="Selecione"
                value={categoryId}
                name="category"
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId(''); // Limpa a subcategoria ao mudar a categoria
                  fetchSubCategories(e.target.value, 0);
                }}
                options={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))}
                onLoadMore={() => {
                  const nextPage = categoryPage + 1;
                  // Exemplo de loadMore para categorias:
                  getAllCategoriesAdmin(nextPage, 10).then((cats) => {
                    setCategories((prev) => [...prev, ...cats.content]);
                    setHasMoreCategories(!cats.last);
                    setCategoryPage(nextPage);
                  });
                }}
                hasMore={hasMoreCategories}
              />

              {/* Renderiza o campo de Subcategoria somente se uma categoria estiver selecionada */}
              {categoryId && (
                <CustomSelect
                  title="SubCategoria"
                  placeholder="Selecione"
                  value={subCategoryId}
                  name="subcategory"
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  options={subCategories.map((sub: any) => ({ value: sub.id, label: sub.name }))}
                  onLoadMore={() => {
                    const nextPage = subCategoryPage + 1;
                    fetchSubCategories(categoryId, nextPage);
                  }}
                  hasMore={hasMoreSubCategories}
                />
              )}
            </div>

            <div className={styles.flexFormInput}>
              <CustomInput
                title="Peso Líquido"
                type="number"
                name="netWeight"
                value={netWeight}
                onChange={(e) => setNetWeight(Number(e.target.value))}
                bottomLeftText="Em kg"
              />

              <CustomInput
                title="Peso Bruto"
                type="number"
                name="grossWeight"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value))}
                bottomLeftText="Em kg"
              />

              <CustomInput
                title="Largura"
                type="number"
                name="width"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                bottomLeftText="Em cm"
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomInput
                title="Altura"
                type="number"
                name="height"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                bottomLeftText="Em cm"
              />

              <CustomInput
                title="Profundidade"
                type="number"
                name="depth"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                bottomLeftText="Em cm"
              />

              <CustomInput
                title="Volumes"
                type="number"
                name="volumes"
                value={volumes}
                onChange={(e) => setVolumes(Number(e.target.value))}
                bottomLeftText="Divisão"
              />
            </div>            


            <div className={styles.flexFormInput}>
              <CustomInput
                title="Itens por Caixa"
                type="number"
                name="itemsPerBox"
                value={itemsPerBox}
                onChange={(e) => setItemsPerBox(Number(e.target.value))}
              />

              <div className={styles.freeShippingContainer}>                          
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                  className={styles.freeShippingCheckbox}
                />
                <span className={styles.freeShippingLabel}>Frete Grátis</span>
              </div>

              <CustomInput
                title="Data de Validade"
                type="date"
                name="expirationDate"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />

            </div>  

            <div className={styles.flexFormInput}>
              <CustomInput
                title="GTIN EAN"
                type="text"
                name="gtinEan"
                value={gtinEan}
                onChange={(e) => setGtinEan(e.target.value)}
              />
              <CustomInput
                title="GTIN EAN Tax"
                type="text"
                name="gtinEanTax"
                value={gtinEanTax}
                onChange={(e) => setGtinEanTax(e.target.value)}
              />
            </div> 
          </ExpandableCard>

          {/* Associações */}
          {associations.map(
            (assoc, index) =>
              !assoc.isRemoved && (
                <div key={index} className={styles.associationItem}>
                  <div className={styles.associationItemHeader}>
                    <span className={styles.associationTitle}>
                      {assoc.id ? 'Associação Existente' : `#${index + 1}`}
                    </span>
                    <HeaderButton
                      icon={trashIcon}
                      onClick={() => removeAssociation(index)}
                      text="Remover"
                    />
                  </div>

                  <div className={styles.associationFields}>
                    {/* Upload de Imagens da Associação */}
                    <div className={styles.addChannelImageUpload}>
                      {assoc.uploadedImages && assoc.uploadedImages.length > 0 ? (
                        assoc.uploadedImages.map((img, idxImg) => (
                          <div className={styles.imageContainer} key={idxImg}>
                            <Image
                              src={img.preview}
                              alt={`Preview association ${index}-${idxImg}`}
                              className={styles.addChannelImagePreview}
                              width={70}
                              height={70}
                            />
                            <button
                              type="button"
                              className={styles.removeButton}
                              onClick={() => handleRemoveAssocImage(index, idxImg)}
                            >
                              ×
                            </button>
                          </div>
                        ))
                      ) : (
                        <Image
                          src={defaultImage.src}
                          alt="Preview"
                          className={styles.addChannelImagePreview}
                          width={70}
                          height={70}
                        />
                      )}
                      <div className={styles.addChannelUploadSection}>
                        <label
                          htmlFor={`assoc-images-${index}`}
                          className={styles.addChannelUploadButton}
                        >
                          + Adicionar Imagem
                        </label>
                        <input
                          type="file"
                          id={`assoc-images-${index}`}
                          onChange={(ev) => handleAssociationImagesChange(ev, index)}
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    <CustomInput
                      title="Nome"
                      type="text"
                      name={`assoc-name-${index}`}
                      value={assoc.name}
                      onChange={(e) => handleTextChange(e, index, 'name')}
                      bottomLeftText={`Caracteres restantes: ${150 - (assoc.name?.length || 0)}`}
                    />

                    <div className={styles.flexFormInput}>
                      <CustomInput
                        title="Preço"
                        type="number"
                        name="salePrice"
                        value={assoc.salePrice}
                        onChange={(e) =>
                          updateAssociationField(index, 'salePrice', Number(e.target.value))
                        }
                      />
                      <CustomInput
                        title="Desconto"
                        type="number"
                        name="discountPrice"
                        value={assoc.discountPrice}
                        onChange={(e) =>
                          updateAssociationField(index, 'discountPrice', Number(e.target.value))
                        }
                      />
                      <CustomInput
                        title="Estoque"
                        type="number"
                        name="stock"
                        value={assoc.stock}
                        onChange={(e) =>
                          updateAssociationField(index, 'stock', Number(e.target.value))
                        }
                      />
                    </div>

                    <div className={styles.flexFormInput}>
                      <CustomInput
                        title="SKU"
                        type="text"
                        name="skuCode"
                        value={assoc.skuCode}
                        onChange={(e) =>
                          updateAssociationField(index, 'skuCode', e.target.value)
                        }
                        bottomLeftText="Referência do produto"
                      />
                      <CustomInput
                        title="Unidade"
                        type="text"
                        name="unitOfMeasure"
                        value={assoc.unitOfMeasure}
                        onChange={(e) =>
                          updateAssociationField(index, 'unitOfMeasure', e.target.value)
                        }
                        bottomLeftText="Ex: un, kg, etc..."
                      />
                    </div>

                    {/* Sobre da associação */}
                    <ExpandableCard title="Sobre" defaultExpanded={false}>
                      <CustomInput
                        title="Descrição Curta"
                        type="text"
                        name={`assoc-shortDescription-${index}`}
                        value={assoc.shortDescription}
                        isTextarea={true}
                        onChange={(e) => handleTextChange(e, index, 'shortDescription')}
                        bottomLeftText={`Caracteres restantes: ${255 - (assoc.shortDescription?.length || 0)}`}
                      />

                      <CustomInput
                        title="Descrição Complementar"
                        type="text"
                        name={`assoc-complementaryDescription-${index}`}
                        value={assoc.complementaryDescription}
                        isTextarea={true}
                        onChange={(e) => handleTextChange(e, index, 'complementaryDescription')}
                        bottomLeftText={`Caracteres restantes: ${2000 - (assoc.complementaryDescription?.length || 0)}`}
                      />

                      <CustomInput
                        title="Notas"
                        type="text"
                        name={`assoc-notes-${index}`}
                        value={assoc.notes}
                        isTextarea={true}
                        onChange={(e) => handleTextChange(e, index, 'notes')}
                        bottomLeftText={`Caracteres restantes: ${2000 - (assoc.notes?.length || 0)}`}
                      />
                    </ExpandableCard>

                    {/* Características da associação */}
                    <ExpandableCard title="Características" defaultExpanded={false}>
                      <div className={styles.flexFormInput}>
                        <CustomInput
                          title="Itens por Caixa"
                          type="number"
                          name="itemsPerBox"
                          value={assoc.itemsPerBox}
                          onChange={(e) =>
                            updateAssociationField(index, 'itemsPerBox', Number(e.target.value))
                          }
                        />


                        <div className={styles.freeShippingContainer}>                          
                          <input
                            type="checkbox"
                            checked={assoc.freeShipping || false}
                            onChange={(e) =>
                              updateAssociationField(index, 'freeShipping', e.target.checked)
                            }
                            className={styles.freeShippingCheckbox}
                          />
                          <span className={styles.freeShippingLabel}>Frete Grátis</span>
                        </div>


                        <CustomInput
                          title="Data de Validade"
                          type="date"
                          name={`assoc-expirationDate-${index}`}
                          value={assoc.expirationDate || ''}
                          onChange={(e) =>
                            updateAssociationField(index, 'expirationDate', e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.flexFormInput}>
                        <CustomInput
                          title="GTIN EAN"
                          type="text"
                          name="gtinEan"
                          value={assoc.gtinEan}
                          onChange={(e) =>
                            updateAssociationField(index, 'gtinEan', e.target.value)
                          }
                        />
                        <CustomInput
                          title="GTIN EAN Tax"
                          type="text"
                          name="gtinEanTax"
                          value={assoc.gtinEanTax}
                          onChange={(e) =>
                            updateAssociationField(index, 'gtinEanTax', e.target.value)
                          }
                        />
                      </div>
                    </ExpandableCard>
                  </div>
                </div>
              )
          )}

          <StageButton
            type="button"
            onClick={handleAddAssociation}
            text="+ Adicionar Associação"
            backgroundColor="#7B33E5"
          />              

          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Criar" backgroundColor="#7B33E5" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;