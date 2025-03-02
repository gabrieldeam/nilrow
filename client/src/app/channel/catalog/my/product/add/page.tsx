'use client';

import React, { useState, useEffect, useCallback, DragEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import CustomSelect from '@/components/UI/CustomSelect/CustomSelect';
import StageButton from '@/components/UI/StageButton/StageButton';
import ToggleButton from '@/components/UI/ToggleButton/ToggleButton';
import Card from '@/components/UI/Card/Card';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';
import trashIcon from '../../../../../../../public/assets/trash.svg';

import { createProduct } from '@/services/product/productService';
import {
  getAllCategoriesAdmin,
  getSubCategoriesByCategory
} from '@/services/categoryService';
import { getAllBrands } from '@/services/product/brandService';

import {
  ProductDTO,
  ProductType,
  ProductCondition,
  ProductionType,
  TechnicalSpecificationDTO,
  ProductVariationDTO,
  VariationAttributeDTO
} from '@/types/services/product';
import { ImageData, ProductAttribute } from '@/types/pages/channel/catalog/my/product/add';

import defaultImage from '../../../../../../../public/assets/user.png';
import styles from './AddProduct.module.css';

import { useNotification } from '@/hooks/useNotification';

const ProductCreatePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { setMessage } = useNotification();

  // ------------------------------------------------------------------
  // 1) Imagens do PRODUTO PRINCIPAL
  // ------------------------------------------------------------------
  const [mainImages, setMainImages] = useState<ImageData[]>([]);
  // Estados para controlar drag & drop das imagens principais
  const [draggingMainIndex, setDraggingMainIndex] = useState<number | null>(null);

  // ------------------------------------------------------------------
  // 2) Estado dos dados principais do produto
  // ------------------------------------------------------------------
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
  const [volumes, setVolumes] = useState<number>(0);
  const [itemsPerBox, setItemsPerBox] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [shortDescription, setShortDescription] = useState('');
  const [complementaryDescription, setComplementaryDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [gtinEan, setGtinEan] = useState('');
  const [gtinEanTax, setGtinEanTax] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  // ------------------------------------------------------------------
  // 3) Relacionamentos
  // ------------------------------------------------------------------
  const [catalogId, setCatalogId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // ------------------------------------------------------------------
  // 4) Ficha Técnica
  // ------------------------------------------------------------------
  const [technicalSpecifications, setTechnicalSpecifications] = useState<TechnicalSpecificationDTO[]>([]);

  // ------------------------------------------------------------------
  // 5) Atributos + Geração Automática de Variações
  // ------------------------------------------------------------------
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([
    { attributeName: '', values: [] }
  ]);
  const [variations, setVariations] = useState<ProductVariationDTO[]>([]);

  // Para armazenar imagens específicas de cada variação
  // ex.: variationImages[0] = [File1, File2]
  const [variationImages, setVariationImages] = useState<Record<number, ImageData[]>>({});
  // Estados de drag & drop para imagens de variação
  const [draggingVarIndex, setDraggingVarIndex] = useState<{ variation: number; index: number } | null>(null);

  // ------------------------------------------------------------------
  // 6) Categorias, SubCategorias, Marcas e Paginação
  // ------------------------------------------------------------------
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [categoryPage, setCategoryPage] = useState(0);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(true);
  const [subCategoryPage, setSubCategoryPage] = useState(0);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);
  const [brandPage, setBrandPage] = useState(0);

  // =================================================================
  // useEffect para carregar categorias e marcas
  // =================================================================
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

  // Carregar do localStorage / queryparam
  useEffect(() => {
    const storedCatalogId = localStorage.getItem("selectedCatalogId");
    const queryCatalogId = searchParams.get("catalogId");

    if (queryCatalogId) {
      setCatalogId(queryCatalogId);
    } else if (storedCatalogId) {
      setCatalogId(storedCatalogId);
    } else {
      router.push("/channel/catalog/my");
    }
  }, [searchParams, router]);

  // =================================================================
  // Carregar SubCategorias
  // =================================================================
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

  // =================================================================
  // 1) Manipulação de Imagens do PRODUTO PRINCIPAL (drag & drop)
  // =================================================================
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const availableSlots = 5 - mainImages.length;
      if (newFiles.length > availableSlots) {
        setMessage('Você pode enviar no máximo 5 imagens.', 'error');
        newFiles.splice(availableSlots);
      }
      const mapped = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setMainImages((prev) => [...prev, ...mapped]);
    }
  };

  const handleRemoveMainImage = (index: number) => {
    setMainImages((prev) => {
      const arr = [...prev];
      const removed = arr.splice(index, 1)[0];
      URL.revokeObjectURL(removed.preview);
      return arr;
    });
  };

  // DRAG & DROP - Imagens Principais
  const onDragStartMain = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingMainIndex(index);
  };

  const onDragOverMain = (e: React.DragEvent<HTMLDivElement>) => {
    // Precisamos previnir o comportamento default para permitir o drop
    e.preventDefault();
  };

  const onDropMain = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggingMainIndex === null) return;

    setMainImages((prev) => {
      const arr = [...prev];
      const [draggedItem] = arr.splice(draggingMainIndex, 1);
      arr.splice(dropIndex, 0, draggedItem);
      return arr;
    });
    setDraggingMainIndex(null);
  };

  // =================================================================
  // 2) FICHA TÉCNICA
  // =================================================================
  const handleAddSpec = () => {
    // Verifica se o último item já está preenchido
    if (technicalSpecifications.length > 0) {
      const lastSpec = technicalSpecifications[technicalSpecifications.length - 1];
      if (!lastSpec.title.trim() || !lastSpec.content.trim()) {
        setMessage('Preencha título e conteúdo da ficha técnica antes de adicionar outra.', 'error');
        return;
      }
    }
    setTechnicalSpecifications((prev) => [...prev, { title: '', content: '' }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setTechnicalSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleChangeSpec = (idx: number, field: 'title' | 'content', value: string) => {
    setTechnicalSpecifications((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });
  };

  // =================================================================
  // 3) FUNÇÃO DE GERAÇÃO DE VARIAÇÕES (cartesiana)
  // =================================================================
  const generateVariations = useCallback(() => {
    // Verifica se todos os atributos estão preenchidos
    for (const attr of productAttributes) {
      if (!attr.attributeName.trim()) {
        setMessage('Preencha o nome de todos os atributos antes de gerar variações.', 'error');
        return;
      }
      if (attr.values.length === 0 || attr.values.some((v) => !v.trim())) {
        setMessage('Cada atributo deve ter ao menos uma opção preenchida.', 'error');
        return;
      }
    }

    const listOfValues = productAttributes.map((attr) => attr.values).filter((v) => v.length > 0);
    const attributeNames = productAttributes.map((attr) => attr.attributeName);

    if (listOfValues.length === 0 || attributeNames.length === 0) {
      setVariations([]);
      return;
    }

    // Produto cartesiano
    const cartesian = (arrays: string[][]): string[][] => {
      let result: string[][] = [[]];
      for (const arr of arrays) {
        const temp: string[][] = [];
        for (const r of result) {
          for (const val of arr) {
            temp.push([...r, val]);
          }
        }
        result = temp;
      }
      return result;
    };

    const combos = cartesian(listOfValues);

    const newVariations: ProductVariationDTO[] = combos.map((combo) => {
      const attrs: VariationAttributeDTO[] = combo.map((val, idx) => ({
        attributeName: attributeNames[idx],
        attributeValue: val,
      }));
      return {
        id: undefined,
        images: [],
        price: 0,
        discountPrice: 0,
        stock: 0,
        active: true,
        attributes: attrs,
      };
    });

    setVariations(newVariations);
    // Ao regenerar, também limpamos o map de imagens das variações
    setVariationImages({});
  }, [productAttributes, setMessage]);

  const handleGenerateVariationsClick = () => {
    generateVariations();
  };

  // =================================================================
  // 4) ATRIBUTOS PARA GERAÇÃO DE VARIAÇÕES
  // =================================================================
  const handleAddAttribute = () => {
    setProductAttributes((prev) => [...prev, { attributeName: '', values: [] }]);
  };

  const handleRemoveAttribute = (idx: number) => {
    setProductAttributes((prev) => {
      const newArr = prev.filter((_, i) => i !== idx);
      return newArr;
    });
    // Regerar variações
    setTimeout(() => generateVariations(), 0);
  };

  const handleChangeAttributeName = (idx: number, newName: string) => {
    setProductAttributes((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], attributeName: newName };
      return arr;
    });
  };

  const handleAddAttributeValue = (idx: number) => {
    setProductAttributes((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], values: [...arr[idx].values, ''] };
      return arr;
    });
  };

  const handleRemoveAttributeValue = (attrIdx: number, valueIdx: number) => {
    setProductAttributes((prev) => {
      const arr = [...prev];
      const newValues = arr[attrIdx].values.filter((_, i) => i !== valueIdx);
      arr[attrIdx] = { ...arr[attrIdx], values: newValues };
      return arr;
    });
    setTimeout(() => generateVariations(), 0);
  };

  const handleChangeAttributeValue = (attrIdx: number, valueIdx: number, newVal: string) => {
    setProductAttributes((prev) => {
      const arr = [...prev];
      const vals = [...arr[attrIdx].values];
      vals[valueIdx] = newVal;
      arr[attrIdx].values = vals;
      return arr;
    });
  };

  // =================================================================
  // 5) REMOVER VARIAÇÃO INDIVIDUAL
  // =================================================================
  const handleRemoveVariation = (index: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== index));
    // Precisamos reindexar as imagens
    setVariationImages((prev) => {
      const newMapping: Record<number, ImageData[]> = {};
      // Copia tudo, exceto a variação removida
      const oldKeys = Object.keys(prev).sort((a, b) => Number(a) - Number(b));
      let newIndex = 0;
      for (const oldKey of oldKeys) {
        const k = Number(oldKey);
        if (k !== index) {
          newMapping[newIndex] = prev[k];
          newIndex++;
        }
      }
      return newMapping;
    });
  };

  // =================================================================
  // 6) MANIPULAR IMAGENS DE CADA VARIAÇÃO (com drag & drop)
  // =================================================================
  const handleVariationImageChange = (variationIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    // Exemplo: permitir até 4 imagens por variação
    const existing = variationImages[variationIndex] || [];
    const availableSlots = 4 - existing.length;
    if (newFiles.length > availableSlots) {
      setMessage('Você pode enviar no máximo 4 imagens por variação.', 'error');
      newFiles.splice(availableSlots);
    }

    const mapped = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setVariationImages((prev) => ({
      ...prev,
      [variationIndex]: [...existing, ...mapped],
    }));
  };

  const handleRemoveVariationImage = (variationIndex: number, imageIndex: number) => {
    setVariationImages((prev) => {
      const currentList = prev[variationIndex] || [];
      // Cria uma cópia do array para evitar mutações diretas
      const updatedList = [...currentList];
      const removed = updatedList.splice(imageIndex, 1)[0];
      if (removed && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return {
        ...prev,
        [variationIndex]: updatedList,
      };
    });
  };
  

  // DRAG & DROP - Imagens da variação
  const onDragStartVar = (e: DragEvent<HTMLDivElement>, variationIndex: number, imgIndex: number) => {
    setDraggingVarIndex({ variation: variationIndex, index: imgIndex });
  };

  const onDragOverVar = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDropVar = (e: DragEvent<HTMLDivElement>, variationIndex: number, dropIndex: number) => {
    e.preventDefault();
    if (!draggingVarIndex) return;

    const { variation, index: draggedIndex } = draggingVarIndex;
    if (variation !== variationIndex) {
      // Se o usuário está tentando arrastar imagens entre variações diferentes,
      // poderíamos impedir ou suportar. Aqui vamos impedir para simplificar.
      setMessage('Não é possível arrastar imagens entre variações diferentes.', 'error');
      setDraggingVarIndex(null);
      return;
    }

    setVariationImages((prev) => {
      const arr = [...(prev[variationIndex] || [])];
      const [draggedItem] = arr.splice(draggedIndex, 1);
      arr.splice(dropIndex, 0, draggedItem);
      return { ...prev, [variationIndex]: arr };
    });
    setDraggingVarIndex(null);
  };

  // =================================================================
  // 7) MANIPULAR DADOS DA VARIAÇÃO (preço, desconto, estoque etc.)
  // =================================================================
  const handleChangeVariationField = (
    variationIndex: number,
    field: keyof ProductVariationDTO,
    value: any
  ) => {
    setVariations((prev) => {
      const arr = [...prev];
      arr[variationIndex] = { ...arr[variationIndex], [field]: value };
      return arr;
    });
  };

  // =================================================================
  // 8) SUBMIT
  // =================================================================
  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Validação mínima
    if (!name || !skuCode || !salePrice || !unitOfMeasure || !catalogId || !categoryId || !brandId) {
      setMessage('Preencha todos os campos obrigatórios.', 'error');
      return;
    }

    // Montar objeto ProductDTO
    const newProduct: ProductDTO = {
      catalogId,
      images: [], // será gerenciado pelo backend
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
      expirationDate: expirationDate || null,
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
      technicalSpecifications,
      variations,
    };

    // Precisamos construir o map de imagens das variações => { [index]: File[] }
    const variationImagesMap: Record<number, File[]> = {};
    for (let i = 0; i < variations.length; i++) {
      const imgs = variationImages[i] || [];
      variationImagesMap[i] = imgs.map((img) => img.file);
    }

    try {
      console.log('=== newProduct ===', JSON.stringify(newProduct, null, 2));
      console.log('=== mainImages ===', mainImages.map((m) => m.file.name));
      console.log('=== variationImagesMap ===', variationImagesMap);
      await createProduct(
        newProduct,
        mainImages.map((m) => m.file), // imagens do produto principal
        variationImagesMap // imagens de cada variação
      );
      setMessage('Produto criado com sucesso!', 'success');
      router.push('/channel/catalog/my/product');
    } catch (error: any) {
      console.error('Erro ao criar produto:', error);
      if (error.response?.data) {
        // 'error.response.data' deve ser o objeto com { campo: mensagem }
        const errorsObj = error.response.data as Record<string, string>;
    
        // Iteramos sobre cada key e exibimos a mensagem em um 'setMessage'
        Object.entries(errorsObj).forEach(([field, message]) => {
          // Por exemplo: setMessage(`${field} -> ${message}`, 'error');
          // Se preferir, pode exibir apenas a mensagem sem o nome do campo
          setMessage(message, 'error');
        });
      } else {
        setMessage('Ocorreu um erro ao criar o produto!', 'error');
      }
    }
  }, [
    name, skuCode, salePrice, discountPrice, unitOfMeasure, type, condition, productionType,
    freeShipping, netWeight, grossWeight, width, height, depth, volumes, itemsPerBox, gtinEan,
    gtinEanTax, shortDescription, complementaryDescription, notes, stock, catalogId, categoryId,
    subCategoryId, brandId, technicalSpecifications, variations, mainImages, variationImages,
    router, setMessage
  ]);

  // =================================================================
  // Helpers p/ textareas
  // =================================================================
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    let maxLength = 0;

    if (name === 'name') maxLength = 150;
    else if (name === 'shortDescription') maxLength = 255;
    else if (name === 'complementaryDescription' || name === 'notes') maxLength = 2000;

    if (maxLength && value.length > maxLength) {
      return;
    }

    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'shortDescription':
        setShortDescription(value);
        break;
      case 'complementaryDescription':
        setComplementaryDescription(value);
        break;
      case 'notes':
        setNotes(value);
        break;
    }
  };

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Criar Produto</title>
      </Head>

      {isMobile && (
        <MobileHeader
          title="Criar Produto"
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
          {/* Upload Imagens do Produto Principal */}
          <div className={styles.addChannelImageUpload}>          

            {mainImages.map((image, index) => (
              <div
                key={index}
                className={styles.imageContainer}
                draggable
                onDragStart={(e) => onDragStartMain(e, index)}
                onDragOver={onDragOverMain}
                onDrop={(e) => onDropMain(e, index)}
              >
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
                  onClick={() => handleRemoveMainImage(index)}
                >
                  ×
                </button>
              </div>              
            ))}

            {mainImages.length === 0 && (
              <Image
                src={defaultImage.src}
                alt="Preview"
                className={styles.addChannelImagePreview}
                width={70}
                height={70}
              />
            )}
            
            {mainImages.length < 5 && (
              <div className={styles.addChannelUploadSection}>
                <label htmlFor="mainImageUpload" className={styles.addChannelUploadButton}>
                  + Adicionar Imagem
                </label>
                <input
                  type="file"
                  id="mainImageUpload"
                  onChange={handleMainImageChange}
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                />
              </div>
            )}
            
          </div>

          {/* Dados Básicos */}
          <Card title="Dados Básicos">
            <CustomInput
              title="Nome *"
              name="name"
              value={name}
              onChange={handleTextChange}
              bottomLeftText={`Máx 150 chars - Restante: ${150 - name.length}`}
            />
            <div className={styles.flexFormInput}>
              <CustomInput
                title="Preço *"
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
                title="SKU *"
                name="skuCode"
                value={skuCode}
                onChange={(e) => setSkuCode(e.target.value)}
                bottomLeftText="Ex: ABC123"
              />
              <CustomInput
                title="Unidade *"
                name="unitOfMeasure"
                value={unitOfMeasure}
                onChange={(e) => setUnitOfMeasure(e.target.value)}
                bottomLeftText="Ex: un, kg, etc."
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Tipo de Produto *"
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                options={[
                  { value: ProductType.PRODUCT, label: 'Produto' },
                  { value: ProductType.SERVICE, label: 'Serviço' },
                ]}
              />
              <CustomSelect
                title="Condição *"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
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
              name="shortDescription"
              isTextarea
              value={shortDescription}
              onChange={handleTextChange}
              bottomLeftText={`Max 255 chars - restam ${255 - shortDescription.length}`}
            />
            <CustomInput
              title="Descrição Complementar"
              name="complementaryDescription"
              isTextarea
              value={complementaryDescription}
              onChange={handleTextChange}
              bottomLeftText={`Max 2000 chars - restam ${2000 - complementaryDescription.length}`}
            />
            <CustomInput
              title="Notas"
              name="notes"
              isTextarea
              value={notes}
              onChange={handleTextChange}
              bottomLeftText={`Max 2000 chars - restam ${2000 - notes.length}`}
            />
          </ExpandableCard>

          {/* Características */}
          <ExpandableCard title="Características" defaultExpanded={false}>
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Marca *"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                options={brands.map((b: any) => ({ value: b.id, label: b.name }))}
                onLoadMore={() => {
                  const nextPage = brandPage + 1;
                  getAllBrands(nextPage, 10).then((resp) => {
                    setBrands((prev) => [...prev, ...resp.content]);
                    setHasMoreBrands(!resp.last);
                    setBrandPage(nextPage);
                  });
                }}
                hasMore={hasMoreBrands}
              />
              <CustomSelect
                title="Produção *"
                value={productionType}
                onChange={(e) => setProductionType(e.target.value as ProductionType)}
                options={[
                  { value: ProductionType.OWN, label: 'Própria' },
                  { value: ProductionType.THIRD_PARTY, label: 'Terceiros' },
                ]}
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Categoria *"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                  fetchSubCategories(e.target.value, 0);
                }}
                options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                onLoadMore={() => {
                  const nextPage = categoryPage + 1;
                  getAllCategoriesAdmin(nextPage, 10).then((res) => {
                    setCategories((prev) => [...prev, ...res.content]);
                    setHasMoreCategories(!res.last);
                    setCategoryPage(nextPage);
                  });
                }}
                hasMore={hasMoreCategories}
              />
              {categoryId && (
                <CustomSelect
                  title="SubCategoria"
                  value={subCategoryId}
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
                value={netWeight}
                onChange={(e) => setNetWeight(Number(e.target.value))}
                bottomLeftText="kg"
              />
              <CustomInput
                title="Peso Bruto"
                type="number"
                value={grossWeight}
                onChange={(e) => setGrossWeight(Number(e.target.value))}
                bottomLeftText="kg"
              />
              <CustomInput
                title="Largura"
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                bottomLeftText="cm"
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomInput
                title="Altura"
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                bottomLeftText="cm"
              />
              <CustomInput
                title="Profund."
                type="number"
                value={depth}
                onChange={(e) => setDepth(Number(e.target.value))}
                bottomLeftText="cm"
              />
              <CustomInput
                title="Volumes"
                type="number"
                value={volumes}
                onChange={(e) => setVolumes(Number(e.target.value))}
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomInput
                title="Itens/Caixa"
                type="number"
                value={itemsPerBox}
                onChange={(e) => setItemsPerBox(Number(e.target.value))}
              />
              <div className={styles.freeShippingContainer}>
                <input
                  type="checkbox"
                  checked={freeShipping}
                  onChange={(e) => setFreeShipping(e.target.checked)}
                />
                <span>Frete Grátis</span>
              </div>
              <CustomInput
                title="Validade"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomInput
                title="GTIN/EAN"
                type="text"
                value={gtinEan}
                onChange={(e) => setGtinEan(e.target.value)}
              />
              <CustomInput
                title="GTIN/EAN Tax"
                type="text"
                value={gtinEanTax}
                onChange={(e) => setGtinEanTax(e.target.value)}
              />
            </div>
          </ExpandableCard>

          {/* Ficha Técnica */}
          {technicalSpecifications.map((spec, index) => (
            <Card key={index}>
              <div className={styles.flexFormInput}>
                <CustomInput
                  title="Título"
                  value={spec.title}
                  onChange={(e) => handleChangeSpec(index, 'title', e.target.value)}
                />
                <CustomInput
                  title="Conteúdo"
                  value={spec.content}
                  onChange={(e) => handleChangeSpec(index, 'content', e.target.value)}
                />
                <HeaderButton
                  icon={trashIcon}
                  onClick={() => handleRemoveSpec(index)}
                />
              </div>
            </Card>
          ))}

          <StageButton
            type="button"
            onClick={handleAddSpec}
            text="+ Adicionar Ficha Técnica"
            backgroundColor="#7B33E5"
          />

          {/* Atributos => Geração de Variações */}
          <ExpandableCard title="Variações" defaultExpanded={false}>
            {productAttributes.map((attr, idx) => (
              <div key={idx} className={styles.attributeBlock}>
                <div className={styles.flexFormInput}>
                  <CustomInput
                    title="Nome do Atributo"
                    value={attr.attributeName}
                    onChange={(e) => handleChangeAttributeName(idx, e.target.value)}
                  />
                  <HeaderButton
                    icon={trashIcon}
                    onClick={() => handleRemoveAttribute(idx)}
                  />
                </div>
                {/* Lista de valores */}
                {attr.values.map((val, vIdx) => (
                  <div key={vIdx} className={styles.flexFormInput}>
                    <CustomInput
                      title="Opção"
                      value={val}
                      onChange={(e) => handleChangeAttributeValue(idx, vIdx, e.target.value)}
                    />
                    <HeaderButton
                      icon={trashIcon}
                      onClick={() => handleRemoveAttributeValue(idx, vIdx)}
                    />
                  </div>
                ))}
                <StageButton
                  type="button"
                  text="+ Adicionar Opções"
                  backgroundColor="#7B33E5"
                  onClick={() => handleAddAttributeValue(idx)}
                />
              </div>
            ))}
            <StageButton
              type="button"
              text="+ Atributo"
              backgroundColor="#7B33E5"
              onClick={handleAddAttribute}
            />
            <div style={{ marginTop: '1rem' }}>
              <StageButton
                type="button"
                text="Gerar Variações"
                backgroundColor="#7B33E5"
                onClick={handleGenerateVariationsClick}
              />
            </div>
          </ExpandableCard>

          {/* Lista de Variações Geradas */}
          {variations.map((variation, index) => {
            const varImgs = variationImages[index] || [];
            return (
              <Card key={index}>
                <div className={styles.variationCard}>
                  {/* Cabeçalho da variação com título e botão de excluir */}
                  <div className={styles.variationHeader}>
                    <h4>
                      {variation.attributes
                        .map((attr) => `${attr.attributeName}: ${attr.attributeValue}`)
                        .join(' | ')}
                    </h4>
                    <div>
                      <HeaderButton
                        icon={trashIcon}
                        onClick={() => handleRemoveVariation(index)}
                      />
                      <div className={styles.freeShippingContainer}>
                        <ToggleButton
                          initial={variation.active}
                          onToggle={(newState) => handleChangeVariationField(index, 'active', newState)}
                        />
                        <span>{variation.active ? 'Ativo' : 'Desativo'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Upload de imagens específicas da variação, com DnD */}
                  <div className={styles.addChannelImageUploadVar}>
                    {varImgs.map((img, i2) => (
                      <div
                        key={i2}
                        className={styles.imageContainer}
                        draggable
                        onDragStart={(e) => onDragStartVar(e, index, i2)}
                        onDragOver={onDragOverVar}
                        onDrop={(e) => onDropVar(e, index, i2)}
                      >
                        <Image
                          src={img.preview}
                          alt={`VarImg ${i2}`}
                          className={styles.addChannelImagePreview}
                          width={60}
                          height={60}
                        />
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemoveVariationImage(index, i2)}
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {varImgs.length === 0 && (
                      <Image
                        src={defaultImage.src}
                        alt="Preview"
                        className={styles.addChannelImagePreview}
                        width={60}
                        height={60}
                      />
                    )}

                    {varImgs.length < 4 && (
                      <div className={styles.addChannelUploadSection}>
                        <label
                          htmlFor={`variationUpload-${index}`}
                          className={styles.addChannelUploadButton}
                        >
                          + Adicionar Imagem
                        </label>
                        <input
                          type="file"
                          id={`variationUpload-${index}`}
                          onChange={(e) => handleVariationImageChange(index, e)}
                          multiple
                          accept="image/*"
                          style={{ display: 'none' }}
                        />
                      </div>
                    )}
                    
                  </div>

                  {/* Campos de preço, desconto, estoque */}
                  <div className={styles.flexFormInput}>
                    <CustomInput
                      title="Preço"
                      type="number"
                      value={variation.price}
                      onChange={(e) =>
                        handleChangeVariationField(index, 'price', Number(e.target.value))
                      }
                    />
                    <CustomInput
                      title="Desconto"
                      type="number"
                      value={variation.discountPrice}
                      onChange={(e) =>
                        handleChangeVariationField(index, 'discountPrice', Number(e.target.value))
                      }
                    />
                    <CustomInput
                      title="Estoque"
                      type="number"
                      value={variation.stock}
                      onChange={(e) =>
                        handleChangeVariationField(index, 'stock', Number(e.target.value))
                      }
                    />
                  </div>
                </div>
              </Card>
            );
          })}

          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Criar Produto" type="submit" backgroundColor="#7B33E5" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;
