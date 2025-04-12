'use client';

import React, { Suspense, useState, useEffect, useCallback, DragEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import ModalTemplate from '@/components/Modals/ModaTemplate/ModalTemplate';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import CustomSelect from '@/components/UI/CustomSelect/CustomSelect';
import StageButton from '@/components/UI/StageButton/StageButton';
import ToggleButton from '@/components/UI/ToggleButton/ToggleButton';
import Card from '@/components/UI/Card/Card';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';

import trashIcon from '../../../../../../../public/assets/trash.svg';
import defaultImage from '../../../../../../../public/assets/user.png';

import styles from './AddProduct.module.css';

import { createProduct, createVariationImage } from '@/services/product/productService';
import {
  getAllCategoriesAdmin,
  getSubCategoriesByCategory
} from '@/services/categoryService';
import { getAllBrands } from '@/services/product/brandService';
import { getProductTemplateById } from '@/services/product/productTemplateService';

import { 
  ProductDTO, 
  ProductType, 
  ProductCondition,
  ProductionType,
  TechnicalSpecificationDTO,
  ProductVariationDTO,
  VariationAttributeDTO,
} from '@/types/services/product';

import {
  ProductTemplateDTO,
  ProductTemplateVariationDTO
} from '@/types/services/productTemplate';

import { ImageData, ProductAttribute } from '@/types/pages/channel/catalog/my/product/add';
import { useNotification } from '@/hooks/useNotification';

interface Option {
  id: string;
  name: string;
}

/**
 * Converte URL em File (baixando a imagem e transformando em Blob).
 */
async function urlToFile(url: string, filename: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  const extension = blob.type.split('/')[1] || 'jpg';
  return new File([blob], `${filename}.${extension}`, { type: blob.type });
}

/**
 * Converte um array de URLs em um array de ImageData (com file + preview).
 */
async function convertUrlArrayToImageData(urls: string[], prefix: string): Promise<ImageData[]> {
  const mappedPromises = urls.map(async (url, index) => {
    const file = await urlToFile(url, `${prefix}-${index}`);
    return {
      file,
      preview: URL.createObjectURL(file),
    };
  });
  return Promise.all(mappedPromises);
}

const ProductCreateContent: React.FC = () => {
  // ----------------------------------------------------------
  // 0) Configurações básicas
  // ----------------------------------------------------------
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { setMessage } = useNotification();

  // Prefixo de API
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // ----------------------------------------------------------
  // 1) Estado de abertura/fechamento do ModalTemplate
  // ----------------------------------------------------------
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ----------------------------------------------------------
  // 2) ID do template selecionado (caso exista)
  // ----------------------------------------------------------
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // ----------------------------------------------------------
  // 3) Estado para armazenar imagens do PRODUTO PRINCIPAL
  // ----------------------------------------------------------
  const [mainImages, setMainImages] = useState<ImageData[]>([]);
  const [draggingMainIndex, setDraggingMainIndex] = useState<number | null>(null);

  // ----------------------------------------------------------
  // 4) Estado dos dados principais do produto
  // ----------------------------------------------------------
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
  const [variations, setVariations] = useState<ProductVariationDTO[]>([]);

  // ----------------------------------------------------------
  // 5) Relacionamentos
  // ----------------------------------------------------------
  const [catalogId, setCatalogId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // ----------------------------------------------------------
  // 6) Ficha Técnica
  // ----------------------------------------------------------
  const [technicalSpecifications, setTechnicalSpecifications] = useState<TechnicalSpecificationDTO[]>([]);

  // ----------------------------------------------------------
  // 7) Atributos + Geração Automática de Variações
  // ----------------------------------------------------------
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([
    { attributeName: '', values: [] }
  ]);

  // ----------------------------------------------------------
  // 8) Imagens de cada variação + drag&drop
  // ----------------------------------------------------------
  const [variationImages, setVariationImages] = useState<Record<number, ImageData[]>>({});
  const [draggingVarIndex, setDraggingVarIndex] = useState<{ variation: number; index: number } | null>(null);

  // ----------------------------------------------------------
  // 9) Categorias, SubCategorias, Marcas + paginação
  // ----------------------------------------------------------
  const [categories, setCategories] = useState<Option[]>([]);
  const [subCategories, setSubCategories] = useState<Option[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [categoryPage, setCategoryPage] = useState(0);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(true);
  const [subCategoryPage, setSubCategoryPage] = useState(0);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);
  const [brandPage, setBrandPage] = useState(0);

  // ----------------------------------------------------------
  // useEffect para carregar categorias e marcas (inicial)
  // ----------------------------------------------------------
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const cats = await getAllCategoriesAdmin(0, 10);
        setCategories(cats.content);
        setHasMoreCategories(!cats.last);

        const brs = await getAllBrands(0, 10);
        setBrands(brs.content);
        setHasMoreBrands(!brs.last);
      } catch (error: unknown) {
        console.error('Erro ao buscar dados iniciais:', error);
      }
    }
    fetchInitialData();
  }, []);

  // ----------------------------------------------------------
  // Carregar do localStorage / queryparam
  // ----------------------------------------------------------
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

  // ----------------------------------------------------------
  // Carregar subcategorias quando a categoria for alterada
  // ----------------------------------------------------------
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
    } catch (error: unknown) {
      console.error('Erro ao buscar subcategorias:', error);
    }
  }

  // ----------------------------------------------------------
  // 1) Manipulação de Imagens do PRODUTO PRINCIPAL (drag & drop)
  // ----------------------------------------------------------
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
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return arr;
    });
  };

  const onDragStartMain = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggingMainIndex(index);
  };

  const onDragOverMain = (e: React.DragEvent<HTMLDivElement>) => {
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

  // ----------------------------------------------------------
  // 2) FICHA TÉCNICA
  // ----------------------------------------------------------
  const handleAddSpec = () => {
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

  const handleChangeSpec = (idx: number, key: 'title' | 'content', value: string) => {
    setTechnicalSpecifications((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [key]: value };
      return arr;
    });
  };

  // ----------------------------------------------------------
  // 3) FUNÇÃO DE GERAÇÃO DE VARIAÇÕES (cartesiana)
  // ----------------------------------------------------------
  const generateVariations = useCallback(() => {
    for (const attr of productAttributes) {
      if (!attr.attributeName?.trim()) {
        setMessage('Preencha corretamente o nome de todos os atributos.', 'error');
        return;
      }
      if (!attr.values.length || attr.values.some((v) => !v.trim())) {
        setMessage('Cada atributo precisa ter pelo menos uma opção preenchida.', 'error');
        return;
      }
    }
  
    const createVariationKey = (attributes: VariationAttributeDTO[]) => {
      const sorted = attributes.slice().sort((a, b) =>
        (a.attributeName || '').localeCompare(b.attributeName || '')
      );
      return sorted.map(attr => `${attr.attributeName}:${attr.attributeValue}`).join('|');
    };
  
    const areAttributesSimilar = (
      attrs1: VariationAttributeDTO[],
      attrs2: VariationAttributeDTO[]
    ) => {
      if (attrs1.length !== attrs2.length) return false;
      const sorted1 = attrs1.slice().sort((a, b) =>
        (a.attributeName || '').localeCompare(b.attributeName || '')
      );
      const sorted2 = attrs2.slice().sort((a, b) =>
        (a.attributeName || '').localeCompare(b.attributeName || '')
      );
      for (let i = 0; i < sorted1.length; i++) {
        if (sorted1[i].attributeName !== sorted2[i].attributeName) return false;
        const val1 = (sorted1[i].attributeValue || '').toLowerCase();
        const val2 = (sorted2[i].attributeValue || '').toLowerCase();
        if (val1 === val2) continue;
        if (val1.includes(val2) || val2.includes(val1)) continue;
        return false;
      }
      return true;
    };
  
    const attributeNames = productAttributes.map(attr => attr.attributeName!);
    const attributeValues = productAttributes.map(attr => attr.values);

    // Produto cartesiano
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
        [[]]
      );
    };
  
    const combos = cartesian(attributeValues);
  
    // Mapeia variações existentes
    const variationMap = new Map<string, ProductVariationDTO>();
    variations.forEach(variation => {
      if (variation.attributes) {
        const key = createVariationKey(variation.attributes);
        if (!variationMap.has(key)) {
          variationMap.set(key, variation);
        }
      }
    });
  
    const newVariations: ProductVariationDTO[] = combos.map(combo => {
      const attributes: VariationAttributeDTO[] = combo.map((val, idx) => ({
        attributeName: attributeNames[idx],
        attributeValue: val,
      }));
      const key = createVariationKey(attributes);
      let matchedVariation = variationMap.get(key);
      if (!matchedVariation) {
        // Tenta encontrar variações semelhantes
        for (const [, oldVariation] of variationMap) {
          if (oldVariation.attributes && areAttributesSimilar(oldVariation.attributes, attributes)) {
            matchedVariation = oldVariation;
            break;
          }
        }
      }
      if (matchedVariation) {
        return { ...matchedVariation, attributes };
      }
      return {
        id: undefined,
        name: '',
        price: 0,
        discountPrice: 0,
        stock: 0,
        active: false,
        images: [],
        attributes,
      };
    });
  
    setVariations(newVariations);
  
    // Ajustar mapping de imagens entre variações
    setVariationImages((prev) => {
      const imagesMap = new Map<string, ImageData[]>();
      Object.keys(prev).forEach(keyStr => {
        const idx = Number(keyStr);
        const varObj = variations[idx];
        if (varObj && varObj.attributes) {
          const oldKey = createVariationKey(varObj.attributes);
          imagesMap.set(oldKey, prev[idx]);
        }
      });
      const newMapping: Record<number, ImageData[]> = {};
      newVariations.forEach((variation, newIdx) => {
        const newKey = variation.attributes ? createVariationKey(variation.attributes) : '';
        if (imagesMap.has(newKey)) {
          newMapping[newIdx] = imagesMap.get(newKey)!;
        } else {
          // Tenta achar variações parecidas
          let found: ImageData[] | undefined;
          for (const [oldKey, imgs] of imagesMap.entries()) {
            const oldAttributes = oldKey.split('|').map(pair => pair.split(':')[1]);
            const newAttributes = newKey.split('|').map(pair => pair.split(':')[1]);
            if (oldAttributes.length === newAttributes.length) {
              let similarCount = 0;
              for (let i = 0; i < newAttributes.length; i++) {
                const a = newAttributes[i].toLowerCase();
                const b = oldAttributes[i].toLowerCase();
                if (a === b || a.includes(b) || b.includes(a)) {
                  similarCount++;
                }
              }
              if (similarCount === newAttributes.length) {
                found = imgs;
                break;
              }
            }
          }
          newMapping[newIdx] = found || [];
        }
      });
      return newMapping;
    });
  }, [productAttributes, variations, setMessage]);

  const handleGenerateVariationsClick = () => {
    generateVariations();
  };

  // ----------------------------------------------------------
  // 4) ATRIBUTOS PARA GERAÇÃO DE VARIAÇÕES
  // ----------------------------------------------------------
  const handleAddAttribute = () => {
    if (productAttributes.length >= 3) {
      setMessage('Você pode adicionar no máximo 3 atributos.', 'error');
      return;
    }
  
    setProductAttributes((prev) => [...prev, { attributeName: '', values: [] }]);
  };

  const handleRemoveAttribute = (idx: number) => {
    setProductAttributes((prev) => prev.filter((_, i) => i !== idx));
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
      arr[attrIdx].values[valueIdx] = newVal;
      return arr;
    });
  };

  // ----------------------------------------------------------
  // 5) REMOVER VARIAÇÃO INDIVIDUAL
  // ----------------------------------------------------------
  const handleRemoveVariation = (index: number) => {
    setVariations((prev) => prev.filter((_, i) => i !== index));
    setVariationImages((prev) => {
      const newMapping: Record<number, ImageData[]> = {};
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

  // ----------------------------------------------------------
  // 6) MANIPULAR IMAGENS DE CADA VARIAÇÃO (drag & drop)
  // ----------------------------------------------------------
  const handleVariationImageChange = (variationIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
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

  const onDragStartVar = (
    e: DragEvent<HTMLDivElement>,
    variationIndex: number,
    imgIndex: number
  ) => {
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

  // ----------------------------------------------------------
  // 7) MANIPULAR DADOS DA VARIAÇÃO
  // ----------------------------------------------------------
  const handleChangeVariationField = (
    variationIndex: number,
    field: 'price' | 'discountPrice' | 'stock' | 'active' | 'name',
    value: number | boolean | string
  ) => {
    setVariations((prev) => {
      const arr = [...prev];
      const current = arr[variationIndex];
    
      if (field === 'active' && value === true) {
        const price = current.price ?? 0;
        const stock = current.stock ?? 0;
    
        if (price <= 0 || stock <= 0) {
          setMessage('Para ativar a variação, defina preço e estoque maiores que zero.', 'error');
          return prev;
        }
      }
    
      arr[variationIndex] = { ...current, [field]: value };
      return arr;
    });        
  };

  // ----------------------------------------------------------
  // FUNÇÃO AUXILIAR: converte ProductTemplateVariationDTO -> ProductVariationDTO
  // ----------------------------------------------------------
  const mapTemplateVariations = (templateVariations: ProductTemplateVariationDTO[]): ProductVariationDTO[] => {
    return templateVariations.map((tv) => {
      const mappedAttributes: VariationAttributeDTO[] = tv.attributes.map(attr => ({
        attributeName: attr.attributeName,
        attributeValue: attr.attributeValue,
      }));
      return {
        id: undefined,
        name: tv.name || '',
        price: 0,
        discountPrice: 0,
        stock: 0,
        active: false,
        images: [],
        attributes: mappedAttributes
      };
    });
  };

  // ----------------------------------------------------------
  // 8) SELEÇÃO DO TEMPLATE
  // ----------------------------------------------------------
  const handleSelectTemplate = async (templateId: string) => {
    try {
      console.log('[handleSelectTemplate] Template ID selecionado:', templateId);
      setSelectedTemplateId(templateId);
      setIsModalOpen(false);

      // 1) Busca o template completo
      const templateData: ProductTemplateDTO = await getProductTemplateById(templateId);
      console.log('[handleSelectTemplate] Dados do template:', templateData);

      // 2) Preenche estados
      setName(templateData.name || '');
      setType(templateData.type || ProductType.PRODUCT);
      setCategoryId(templateData.categoryId || '');
      setSubCategoryId(templateData.subCategoryId || '');
      setBrandId(templateData.brandId || '');
      setNetWeight(templateData.netWeight || 0);
      setGrossWeight(templateData.grossWeight || 0);
      setWidth(templateData.width || 0);
      setHeight(templateData.height || 0);
      setDepth(templateData.depth || 0);
      setVolumes(templateData.volumes || 0);
      setItemsPerBox(templateData.itemsPerBox || 0);
      setShortDescription(templateData.shortDescription || '');
      setComplementaryDescription(templateData.complementaryDescription || '');
      setNotes(templateData.notes || '');

      // 3) Ficha técnica
      if (templateData.technicalSpecifications) {
        const specs: TechnicalSpecificationDTO[] = templateData.technicalSpecifications.map(ts => ({
          title: ts.title,
          content: ts.content
        }));
        setTechnicalSpecifications(specs);
      }

      // 4) Atributos + variações
      let mappedVariations: ProductVariationDTO[] = [];
      if (templateData.variations) {
        mappedVariations = mapTemplateVariations(templateData.variations);
        setVariations(mappedVariations);

        // Extrai nomes de atributos e opções
        const combinedAttrs: Record<string, Set<string>> = {};
        templateData.variations.forEach(tv => {
          tv.attributes.forEach(attr => {
            if (!combinedAttrs[attr.attributeName]) {
              combinedAttrs[attr.attributeName] = new Set();
            }
            combinedAttrs[attr.attributeName].add(attr.attributeValue);
          });
        });
        const newProductAttributes: ProductAttribute[] = Object.entries(combinedAttrs).map(([attrName, valuesSet]) => ({
          attributeName: attrName,
          values: Array.from(valuesSet)
        }));
        setProductAttributes(newProductAttributes);
      }

      // 5) Converte imagens principais
      if (templateData.images && templateData.images.length > 0) {
        const mainImageUrls = templateData.images.slice(0, 5).map(imgPath => `${apiUrl}${imgPath}`);
        const mainImageData = await convertUrlArrayToImageData(mainImageUrls, 'template-main');
        setMainImages(mainImageData);
      } else {
        setMainImages([]);
      }

      // 6) Converte imagens de variações
      const newVariationImages: Record<number, ImageData[]> = {};
      if (templateData.variations) {
        await Promise.all(
          templateData.variations.map(async (tv, varIndex) => {
            if (tv.images && tv.images.length > 0) {
              const urls = tv.images.map(img => `${apiUrl}${img.imageUrl}`).filter(Boolean);
              const varImageData = await convertUrlArrayToImageData(urls, `template-var-${varIndex}`);
              newVariationImages[varIndex] = varImageData;
            } else {
              newVariationImages[varIndex] = [];
            }
          })
        );
      }
      setVariationImages(newVariationImages);

      setMessage('Template carregado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      setMessage('Não foi possível carregar o template selecionado.', 'error');
    }
  };

  // ----------------------------------------------------------
  // 9) SUBMIT do Produto (Criação)
  // ----------------------------------------------------------
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (
        name.trim() === '' ||
        unitOfMeasure.trim() === '' ||
        catalogId.trim() === '' ||
        categoryId.trim() === '' ||
        brandId.trim() === ''
      ) {
        setMessage('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      // Se o template foi selecionado, enviamos productTemplateId; caso contrário, não incluímos
      const newProduct: ProductDTO = {
        ...(selectedTemplateId ? { productTemplateId: selectedTemplateId } : {}),

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

      // LOG para conferir tudo que está indo
      console.log('[handleSubmit] selectedTemplateId:', selectedTemplateId);
      console.log('[handleSubmit] newProduct:', JSON.stringify(newProduct, null, 2));
      console.log('[handleSubmit] mainImages:', mainImages.map((m) => m.file?.name || m.preview));

      try {
        const createdProduct = await createProduct(
          newProduct,
          mainImages.filter(m => !!m.file).map((m) => m.file!)
        );
        setMessage('Produto criado com sucesso! Enviando imagens das variações...', 'success');

        if (createdProduct?.variations) {
          await Promise.all(
            createdProduct.variations.map((createdVar, varIndex) => {
              const imagesForThisVar = variationImages[varIndex] || [];
              return Promise.all(
                imagesForThisVar
                  .filter(img => img.file)
                  .map((imgData, imgIndex) =>
                    createVariationImage(createdVar.id!, imgData.file!, imgIndex)
                  )
              );
            })
          );
        }

        setMessage('Produto e imagens de variações enviados com sucesso!', 'success');
        router.push('/channel/catalog/my/product');
      } catch (error: unknown) {
        console.error('Erro ao criar produto:', error);
        const err = error as { response?: { data: Record<string, string> } };
        if (err.response?.data) {
          Object.entries(err.response.data).forEach(([, message]) => {
            setMessage(message, 'error');
          });
        } else {
          setMessage('Ocorreu um erro ao criar o produto!', 'error');
        }
      }
    },
    [
      name,
      skuCode,
      salePrice,
      discountPrice,
      unitOfMeasure,
      type,
      condition,
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
      catalogId,
      categoryId,
      subCategoryId,
      brandId,
      technicalSpecifications,
      variations,
      mainImages,
      variationImages,
      expirationDate,
      router,
      setMessage,
      selectedTemplateId
    ]
  );

  // ----------------------------------------------------------
  // Helpers p/ textareas (limites de caracteres)
  // ----------------------------------------------------------
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    let maxLength = 0;
    if (name === 'name') maxLength = 150;
    else if (name === 'shortDescription') maxLength = 255;
    else if (name === 'complementaryDescription' || name === 'notes') maxLength = 2000;

    let newValue = value;
    if (maxLength && value.length > maxLength) {
      newValue = value.slice(0, maxLength);
    }

    switch (name) {
      case 'name':
        setName(newValue);
        break;
      case 'shortDescription':
        setShortDescription(newValue);
        break;
      case 'complementaryDescription':
        setComplementaryDescription(newValue);
        break;
      case 'notes':
        setNotes(newValue);
        break;
    }
  };

  // ----------------------------------------------------------
  // Render
  // ----------------------------------------------------------
  return (
    <div className={styles.productPage}>
      <Head>
        <title>Criar Produto</title>
      </Head>

      {/* Header Mobile */}
      {isMobile && (
        <MobileHeader
          title="Criar Produto"
          buttons={{ close: true, template: true }}
          handleBack={() => router.push('/channel/catalog/my/product')}
          handleTemplate={() => setIsModalOpen(true)} 
        />
      )}

      {/* Container Principal */}
      <div className={styles.productContainer}>
        {/* Header Desktop */}
        <div className={styles.productHeader}>
          <SubHeader
            title="Novo Produto"
            handleBack={() => router.push('/channel/catalog/my/product')}
            showTemplateButton={true}
            handleTemplate={() => setIsModalOpen(true)}
          />
        </div>

        {/* Formulário */}
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
              title="Nome"
              name="name"
              value={name}
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${150 - name.length} - Obrigatório`}
            />
            <div className={styles.flexFormInput}>
              <CustomInput
                title="Preço"
                type="number"
                name="salePrice"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
                bottomLeftText="Obrigatório"
              />
              <CustomInput
                title="Desconto"
                type="number"
                name="discountPrice"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(Number(e.target.value))}
                bottomLeftText="Porcentagem"
              />
              <CustomInput
                title="Estoque"
                type="number"
                name="stock"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                bottomLeftText="Obrigatório"
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomInput
                title="SKU"
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
                title="Tipo de Produto"
                value={type}
                onChange={(e) => setType(e.target.value as ProductType)}
                options={[
                  { value: ProductType.PRODUCT, label: 'Produto' },
                  { value: ProductType.SERVICE, label: 'Serviço' },
                ]}
                bottomLeftText="Obrigatório"
              />
              <CustomSelect
                title="Condição"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ProductCondition)}
                options={[
                  { value: ProductCondition.NEW, label: 'Novo' },
                  { value: ProductCondition.USED, label: 'Usado' },
                  { value: ProductCondition.REFURBISHED, label: 'Recondicionado' },
                ]}
                bottomLeftText="Obrigatório"
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
              bottomLeftText={`Caracteres restantes: ${255 - shortDescription.length}`}
            />
            <CustomInput
              title="Descrição Complementar"
              name="complementaryDescription"
              isTextarea
              value={complementaryDescription}
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${2000 - complementaryDescription.length}`}
            />
            <CustomInput
              title="Notas"
              name="notes"
              isTextarea
              value={notes}
              onChange={handleTextChange}
              bottomLeftText={`Caracteres restantes: ${2000 - notes.length}`}
            />
          </ExpandableCard>

          {/* Características */}
          <ExpandableCard title="Características" defaultExpanded={false}>
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Marca"
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                options={brands.map(b => ({ value: b.id, label: b.name }))}
                onLoadMore={() => {
                  const nextPage = brandPage + 1;
                  getAllBrands(nextPage, 10).then((resp) => {
                    setBrands((prev) => [...prev, ...resp.content]);
                    setHasMoreBrands(!resp.last);
                    setBrandPage(nextPage);
                  });
                }}
                hasMore={hasMoreBrands}
                bottomLeftText="Obrigatório"
              />
              <CustomSelect
                title="Produção"
                value={productionType}
                onChange={(e) => setProductionType(e.target.value as ProductionType)}
                options={[
                  { value: ProductionType.OWN, label: 'Própria' },
                  { value: ProductionType.THIRD_PARTY, label: 'Terceiros' },
                ]}
                bottomLeftText="Obrigatório"
              />
            </div>
            <div className={styles.flexFormInput}>
              <CustomSelect
                title="Categoria"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubCategoryId('');
                  fetchSubCategories(e.target.value, 0);
                }}
                options={categories.map(c => ({ value: c.id, label: c.name }))}
                onLoadMore={() => {
                  const nextPage = categoryPage + 1;
                  getAllCategoriesAdmin(nextPage, 10).then((res) => {
                    setCategories((prev) => [...prev, ...res.content]);
                    setHasMoreCategories(!res.last);
                    setCategoryPage(nextPage);
                  });
                }}
                hasMore={hasMoreCategories}
                bottomLeftText="Obrigatório"
              />
              {categoryId && (
                <CustomSelect
                  title="SubCategoria"
                  value={subCategoryId}
                  onChange={(e) => setSubCategoryId(e.target.value)}
                  options={subCategories.map(sub => ({ value: sub.id, label: sub.name }))}
                  onLoadMore={() => {
                    const nextPage = subCategoryPage + 1;
                    fetchSubCategories(categoryId, nextPage);
                  }}
                  hasMore={hasMoreSubCategories}
                  bottomLeftText="Obrigatório"
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
                bottomLeftText="UN"
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
            {productAttributes.length < 3 && (
              <StageButton
                type="button"
                text="+ Atributo"
                backgroundColor="#7B33E5"
                onClick={handleAddAttribute}
              />
            )}

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
                  {/* Upload de imagens específicas da variação */}
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
                  <CustomInput
                    title="Nome"
                    type="text"
                    value={variation.name || ''}
                    onChange={(e) => handleChangeVariationField(index, 'name', e.target.value)}
                  />
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
                      value={variation.discountPrice || 0}
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

          {/* Botão Final de Criar Produto */}
          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Criar Produto" type="submit" backgroundColor="#7B33E5" />
          </div>
        </form>
      </div>

      {/* ModalTemplate */}
      <ModalTemplate
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />
    </div>
  );
};

export default function ProductCreatePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <ProductCreateContent />
    </Suspense>
  );
}
