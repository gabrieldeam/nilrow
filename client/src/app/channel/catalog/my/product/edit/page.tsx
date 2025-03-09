'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  DragEvent,
  Suspense,
} from 'react';
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
import defaultImage from '../../../../../../../public/assets/user.png';

import {
  updateProduct,
  getProductById,
  deleteProduct,
  listVariationImagesByVariation,
  updateVariationImage,
  createVariationImage,
  deleteVariationImage,
} from '@/services/product/productService';
import { getAllCategoriesAdmin, getSubCategoriesByCategory } from '@/services/categoryService';
import { getAllBrands } from '@/services/product/brandService';

import {
  ProductDTO,
  ProductType,
  ProductCondition,
  ProductionType,
  TechnicalSpecificationDTO,
  ProductVariationDTO,
  VariationAttributeDTO,
} from '@/types/services/product';
import { VariationImageDTO } from '@/types/services/product';

import { ImageData, ProductAttribute } from '@/types/pages/channel/catalog/my/product/add';

import { useNotification } from '@/hooks/useNotification';

import styles from './EditProduct.module.css';

// Interfaces auxiliares para paginação e tipagem de categorias/subcategorias/marcas
interface PaginatedResponse<T> {
  content: T[];
  last: boolean;
}

interface Category {
  id: string;
  name: string;
}

interface SubCategory {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
const MAX_MAIN_IMAGES = 5;
const MAX_VARIATION_IMAGES = 4;

const ProductEdit = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const { setMessage } = useNotification();

  const productId = searchParams.get('productId');

  // ========================
  // ESTADOS
  // ========================
  // 1) Imagens do produto principal
  const [mainImages, setMainImages] = useState<ImageData[]>([]);
  const [draggingMainIndex, setDraggingMainIndex] = useState<number | null>(null);

  // 2) Dados do produto
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
  const [initialVariations, setInitialVariations] = useState<ProductVariationDTO[]>([]);

  // 3) Relacionamentos
  const [catalogId, setCatalogId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // 4) Ficha técnica
  const [technicalSpecifications, setTechnicalSpecifications] = useState<TechnicalSpecificationDTO[]>([]);

  // 5) Atributos e variações
  const [productAttributes, setProductAttributes] = useState<ProductAttribute[]>([]);
  const [variations, setVariations] = useState<ProductVariationDTO[]>([]);

  // 6) Imagens de cada variação
  const [variationImages, setVariationImages] = useState<Record<number, ImageData[]>>({});
  const [draggingVarIndex, setDraggingVarIndex] = useState<{ variation: number; index: number } | null>(null);

  // 7) Categorias, Subcategorias, Marcas e paginação
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [categoryPage, setCategoryPage] = useState(0);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(true);
  const [subCategoryPage, setSubCategoryPage] = useState(0);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);
  const [brandPage, setBrandPage] = useState(0);

  // =====================================
  // HOOKS DE EFEITO
  // =====================================
  // A) Redirecionar se não existir productId
  useEffect(() => {
    if (!productId) {
      router.push('/channel/catalog/my/product');
    }
  }, [productId, router]);

  // B) Carregar categorias e marcas iniciais
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const cats = (await getAllCategoriesAdmin(0, 10)) as PaginatedResponse<Category>;
        setCategories(cats.content);
        setHasMoreCategories(!cats.last);

        const brs = (await getAllBrands(0, 10)) as PaginatedResponse<Brand>;
        setBrands(brs.content);
        setHasMoreBrands(!brs.last);
      } catch (error: unknown) {
        console.error('Erro ao buscar dados iniciais:', error);
      }
    }
    fetchInitialData();
  }, []);

  // C) Carregar catalogId do localStorage ou queryParams
  useEffect(() => {
    const storedCatalogId = localStorage.getItem('selectedCatalogId');
    const queryCatalogId = searchParams.get('catalogId');
    if (queryCatalogId) {
      setCatalogId(queryCatalogId);
    } else if (storedCatalogId) {
      setCatalogId(storedCatalogId);
    } else {
      router.push('/channel/catalog/my');
    }
  }, [searchParams, router]);

  // D) Função para carregar subcategorias de uma categoria
  async function fetchSubCategories(catId: string, page = 0) {
    try {
      const subCats = (await getSubCategoriesByCategory(catId, page, 10)) as PaginatedResponse<SubCategory>;
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

  // E) Carregar dados do produto e imagens de variação
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) return;
      try {
        const product: ProductDTO = await getProductById(productId);

        // 1) Seta estados básicos do produto
        setName(product.name);
        setSkuCode(product.skuCode);
        setSalePrice(Number(product.salePrice));
        setDiscountPrice(Number(product.discountPrice || 0));
        setUnitOfMeasure(product.unitOfMeasure);
        setType(product.type);
        setCondition(product.condition);
        setProductionType(product.productionType);
        setFreeShipping(product.freeShipping);
        setNetWeight(Number(product.netWeight || 0));
        setGrossWeight(Number(product.grossWeight || 0));
        setWidth(Number(product.width || 0));
        setHeight(Number(product.height || 0));
        setDepth(Number(product.depth || 0));
        setVolumes(Number(product.volumes || 0));
        setItemsPerBox(Number(product.itemsPerBox || 0));
        setStock(Number(product.stock || 0));
        setShortDescription(product.shortDescription || '');
        setComplementaryDescription(product.complementaryDescription || '');
        setNotes(product.notes || '');
        setGtinEan(product.gtinEan || '');
        setGtinEanTax(product.gtinEanTax || '');
        setExpirationDate(product.expirationDate ? product.expirationDate.toString() : '');
        setCatalogId(product.catalogId);
        setCategoryId(product.categoryId);
        setSubCategoryId(product.subCategoryId);
        setBrandId(product.brandId);
        setTechnicalSpecifications(product.technicalSpecifications || []);

        // 2) Seta variações
        setVariations(product.variations || []);
        setInitialVariations(product.variations || []);

        // 3) Monta `productAttributes` a partir das variações
        if (product.variations && product.variations.length > 0) {
          const attributeMap = new Map<string, Set<string>>();

          product.variations.forEach((variation) => {
            variation.attributes?.forEach((attr) => {
              if (!attr.attributeName || !attr.attributeValue) return;
              if (!attributeMap.has(attr.attributeName)) {
                attributeMap.set(attr.attributeName, new Set());
              }
              attributeMap.get(attr.attributeName)?.add(attr.attributeValue);
            });
          });

          const mappedAttrs: ProductAttribute[] = Array.from(attributeMap.entries()).map(
            ([attrName, valuesSet]) => ({
              attributeName: attrName,
              values: Array.from(valuesSet),
            })
          );
          setProductAttributes(mappedAttrs);
        }

        // 4) Carrega subcategorias se houver categoryId
        if (product.categoryId) {
          await fetchSubCategories(product.categoryId, 0);
        }

        // 5) Imagens principais do produto
        if (product.images && product.images.length > 0) {
          const existingImages: ImageData[] = product.images.map((imgUrl: string) => ({
            file: undefined,
            preview: imgUrl.startsWith('http') ? imgUrl : apiUrl + imgUrl,
            isNew: false,
          }));
          setMainImages(existingImages);
        }

        // 6) Imagens de cada variação
        const varImagesMap: Record<number, ImageData[]> = {};
        if (product.variations && product.variations.length > 0) {
          for (let i = 0; i < product.variations.length; i++) {
            const varItem = product.variations[i];
            if (!varItem.id) continue;
            const backendImages = await listVariationImagesByVariation(varItem.id);
            varImagesMap[i] = backendImages.map((variationImage: VariationImageDTO) => ({
              id: variationImage.id,
              file: undefined,
              preview: variationImage.imageUrl.startsWith('http')
                ? variationImage.imageUrl
                : apiUrl + variationImage.imageUrl,
              isNew: false,
            }));
          }
        }
        setVariationImages(varImagesMap);
      } catch (error: unknown) {
        console.error('Erro ao carregar produto:', error);
        setMessage('Erro ao carregar os dados do produto.', 'error');
        router.push('/channel/catalog/my/product');
      }
    }
    fetchProduct();
  }, [productId, setMessage, router]);

  // =====================================
  // DELETAR O PRODUTO COMPLETO
  // =====================================
  const handleDelete = async () => {
    if (!productId) return;
    try {
      await deleteProduct(productId);
      setMessage('Produto deletado com sucesso!', 'success');
      router.push('/channel/catalog/my/product');
    } catch (error: unknown) {
      console.error('Erro ao deletar produto:', error);
      setMessage('Erro ao deletar o produto.', 'error');
    }
  };

  // =====================================
  // IMAGENS DO PRODUTO PRINCIPAL
  // =====================================
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const availableSlots = MAX_MAIN_IMAGES - mainImages.length;
      if (newFiles.length > availableSlots) {
        setMessage(`Você pode enviar no máximo ${MAX_MAIN_IMAGES} imagens.`, 'error');
        newFiles.splice(availableSlots);
      }
      const mapped = newFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        isNew: true,
      }));
      setMainImages((prev) => [...prev, ...mapped]);
    }
  };

  const handleRemoveMainImage = (index: number) => {
    setMainImages((prev) => {
      const arr = [...prev];
      const removed = arr.splice(index, 1)[0];
      if (removed && removed.isNew && removed.preview) {
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

  // =====================================
  // FICHA TÉCNICA
  // =====================================
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

  const handleChangeSpec = (idx: number, field: 'title' | 'content', value: string) => {
    setTechnicalSpecifications((prev) => {
      const arr = [...prev];
      arr[idx] = { ...arr[idx], [field]: value };
      return arr;
    });
  };

  // =====================================
  // ATRIBUTOS E Variações
  // =====================================
  const generateVariations = useCallback(() => {
    // Validação dos atributos
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

    // Função para criar uma chave única para um conjunto de atributos
    const createVariationKey = (attributes: VariationAttributeDTO[]): string => {
      const sorted = attributes.slice().sort((a, b) =>
        (a.attributeName || '').localeCompare(b.attributeName || '')
      );
      return sorted.map(attr => `${attr.attributeName}:${attr.attributeValue}`).join('|');
    };

    // Função para comparar atributos de forma "fuzzy"
    const areAttributesSimilar = (
      attrs1: VariationAttributeDTO[],
      attrs2: VariationAttributeDTO[]
    ): boolean => {
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

    // Função para gerar o produto cartesiano
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap(a => curr.map(c => [...a, c])),
        [[]]
      );
    };

    const combos = cartesian(attributeValues);

    // Cria um mapa com as variações já existentes usando chave única
    const variationMap = new Map<string, ProductVariationDTO>();
    [...variations, ...initialVariations].forEach(variation => {
      if (variation.attributes) {
        const key = createVariationKey(variation.attributes);
        if (!variationMap.has(key)) {
          variationMap.set(key, variation);
        }
      }
    });

    // Gerar a nova lista de variações
    const newVariations: ProductVariationDTO[] = combos.map(combo => {
      const attributes: VariationAttributeDTO[] = combo.map((val, idx) => ({
        attributeName: attributeNames[idx],
        attributeValue: val,
      }));
      const key = createVariationKey(attributes);
      let matchedVariation = variationMap.get(key);
      if (!matchedVariation) {
        // Tenta encontrar variação similar se não houver chave exata
        for (const [, oldVariation] of variationMap.entries()) {
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
        price: 0,
        discountPrice: 0,
        stock: 0,
        active: true,
        images: [],
        attributes,
      };
    });

    setVariations(newVariations);

    // Atualiza as imagens das variações mantendo as já existentes se forem similares
    setVariationImages((prev) => {
      const imagesMap = new Map<string, ImageData[]>();
      Object.keys(prev).forEach((keyStr) => {
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
  }, [productAttributes, variations, initialVariations, setMessage]);

  const handleGenerateVariationsClick = () => {
    generateVariations();
  };

  const handleAddAttribute = () => {
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
    setProductAttributes((prev) =>
      prev.map((attr, i) =>
        i === idx ? { ...attr, values: [...attr.values, ''] } : attr
      )
    );
  };

  const handleRemoveAttributeValue = (attrIdx: number, valueIdx: number) => {
    setProductAttributes((prev) =>
      prev.map((attr, i) => {
        if (i !== attrIdx) return attr;
        return { ...attr, values: attr.values.filter((_, idx) => idx !== valueIdx) };
      })
    );
  };

  const handleChangeAttributeValue = (attrIdx: number, valueIdx: number, newVal: string) => {
    setProductAttributes((prev) => {
      const arr = [...prev];
      arr[attrIdx].values[valueIdx] = newVal;
      return arr;
    });
  };

  // =====================================
  // MANIPULAÇÃO DE IMAGENS DE VARIAÇÃO
  // =====================================
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

  const handleVariationImageChange = (
    variationIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const existing = variationImages[variationIndex] || [];
    const availableSlots = MAX_VARIATION_IMAGES - existing.length;
    if (newFiles.length > availableSlots) {
      setMessage(`Máximo de ${MAX_VARIATION_IMAGES} imagens por variação.`, 'error');
      newFiles.splice(availableSlots);
    }
    const mapped = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isNew: true,
    }));
    setVariationImages((prev) => ({
      ...prev,
      [variationIndex]: [...existing, ...mapped],
    }));
  };

  const handleRemoveVariationImage = (variationIndex: number, imageIndex: number) => {
    setVariationImages((prev) => {
      const arr = prev[variationIndex] || [];
      if (imageIndex < 0 || imageIndex >= arr.length) {
        return prev;
      }
      const removed = arr.splice(imageIndex, 1)[0];
      if (removed && removed.isNew && removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return {
        ...prev,
        [variationIndex]: [...arr],
      };
    });
  };

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

  // Alterado: tipagem do valor para evitar uso de "any"
  const handleChangeVariationField = (
    variationIndex: number,
    field: keyof ProductVariationDTO,
    value: string | number | boolean
  ) => {
    setVariations((prev) => {
      const arr = [...prev];
      arr[variationIndex] = { ...arr[variationIndex], [field]: value };
      return arr;
    });
  };

  // =====================================
  // SUBMIT: ATUALIZAR PRODUTO
  // =====================================
  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!name || !skuCode || !salePrice || !unitOfMeasure || !catalogId || !categoryId || !brandId) {
        setMessage('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      // 1) Preparar as imagens principais
      const existingMainImageUrls = mainImages
        .filter((img) => !img.isNew)
        .map((img) =>
          img.preview.startsWith(apiUrl) ? img.preview.slice(apiUrl.length) : img.preview
        );
      const newMainImageFiles = mainImages
        .filter((img) => img.isNew && img.file)
        .map((img) => img.file!);

      // 2) Montar objeto do produto (sem imagens de variação)
      const syncedVariations = variations;
      const updatedProduct: ProductDTO = {
        catalogId,
        images: existingMainImageUrls,
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
        variations: syncedVariations,
      };

      try {
        // 3) Atualiza o produto
        await updateProduct(productId!, updatedProduct, newMainImageFiles);
        setMessage('Produto atualizado com sucesso! Atualizando imagens das variações...', 'success');

        // 4) Sincronizar imagens das variações
        for (let varIndex = 0; varIndex < variations.length; varIndex++) {
          const varData = variations[varIndex];
          if (!varData.id) continue;
          const variationId = varData.id as string;
          const currentImages = variationImages[varIndex] || [];

          const serverImages = await listVariationImagesByVariation(variationId);
          const serverIds = serverImages
            .map((si) => si.id)
            .filter((id): id is string => id !== undefined);
          const currentIds = currentImages
            .filter((ci) => ci.id !== undefined)
            .map((ci) => ci.id!);
          const deletedIds = serverIds.filter((id) => !currentIds.includes(id));
          await Promise.all(deletedIds.map((delId) => deleteVariationImage(delId)));

          await Promise.all(
            currentImages.map(async (imgData, i2) => {
              const newOrderIndex = i2;
              if (!imgData.id) {
                if (imgData.file) {
                  await createVariationImage(varData.id!, imgData.file!, newOrderIndex);
                }
              } else {
                const correspondingServer = serverImages.find((si) => si.id === imgData.id);
                const needsFileUpdate = !!imgData.file;
                const needsReorder = correspondingServer?.orderIndex !== newOrderIndex;
                if (needsFileUpdate || needsReorder) {
                  await updateVariationImage(imgData.id!, imgData.file, newOrderIndex);
                }
              }
            })
          );
        }

        setMessage('Produto e imagens de variações atualizadas com sucesso!', 'success');
        router.push('/channel/catalog/my/product');
      } catch (error: unknown) {
        console.error('Erro ao atualizar produto:', error);
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          (error as { response?: { data: Record<string, string> } }).response?.data
        ) {
          const errorsObj = (error as { response: { data: Record<string, string> } }).response.data;
          Object.entries(errorsObj).forEach(([, message]: [string, string]) => {
            setMessage(message, 'error');
          });
        } else {
          setMessage('Ocorreu um erro ao atualizar o produto!', 'error');
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
      router,
      setMessage,
      productId,
      expirationDate,
    ]
  );

  // =====================================
  // HANDLER PARA TEXTAREAS/INPUTS
  // =====================================
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    let maxLength = 0;
    if (name === 'name') maxLength = 150;
    else if (name === 'shortDescription') maxLength = 255;
    else if (name === 'complementaryDescription' || name === 'notes') maxLength = 2000;
    if (maxLength && value.length > maxLength) return;

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

  // =====================================
  // RENDERIZAÇÃO
  // =====================================
  return (
    <div className={styles.productPage}>
      <Head>
        <title>Editar Produto</title>
      </Head>

      {isMobile && (
        <MobileHeader
          title="Editar Produto"
          buttons={{ close: true }}
          handleBack={() => router.push('/channel/catalog/my/product')}
        />
      )}

      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <SubHeader
            title="Editar Produto"
            handleBack={() => router.push('/channel/catalog/my/product')}
            showDeleteButton
            handleDelete={handleDelete}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Imagens do Produto Principal */}
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
            {mainImages.length < MAX_MAIN_IMAGES && (
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
                options={brands.map((b: Category) => ({ value: b.id, label: b.name }))}
                onLoadMore={() => {
                  const nextPage = brandPage + 1;
                  getAllBrands(nextPage, 10).then((resp) => {
                    const data = resp as PaginatedResponse<Brand>;
                    setBrands((prev) => [...prev, ...data.content]);
                    setHasMoreBrands(!data.last);
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
                options={categories.map((c: Category) => ({ value: c.id, label: c.name }))}
                onLoadMore={() => {
                  const nextPage = categoryPage + 1;
                  getAllCategoriesAdmin(nextPage, 10).then((res) => {
                    const data = res as PaginatedResponse<Category>;
                    setCategories((prev) => [...prev, ...data.content]);
                    setHasMoreCategories(!data.last);
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
                  options={subCategories.map((sub: SubCategory) => ({ value: sub.id, label: sub.name }))}
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
                <HeaderButton icon={trashIcon} onClick={() => handleRemoveSpec(index)} />
              </div>
            </Card>
          ))}
          <StageButton
            type="button"
            onClick={handleAddSpec}
            text="+ Adicionar Ficha Técnica"
            backgroundColor="#7B33E5"
          />

          {/* Atributos e Variações */}
          <ExpandableCard title="Variações" defaultExpanded={false}>
            {productAttributes.map((attr, idx) => (
              <div key={idx} className={styles.attributeBlock}>
                <div className={styles.flexFormInput}>
                  <CustomInput
                    title="Nome do Atributo"
                    value={attr.attributeName}
                    onChange={(e) => handleChangeAttributeName(idx, e.target.value)}
                  />
                  <HeaderButton icon={trashIcon} onClick={() => handleRemoveAttribute(idx)} />
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

          {/* Lista de Variações */}
          {variations.map((variation, index) => {
            const isActive: boolean = !!variation.active;
            const varImgs = variationImages[index] || [];

            return (
              <Card key={index}>
                <div className={styles.variationCard}>
                  <div className={styles.variationHeader}>
                    <h4>
                      {variation.attributes
                        ?.map((attr) => `${attr.attributeName}: ${attr.attributeValue}`)
                        .join(' | ')}
                    </h4>
                    <div>
                      <HeaderButton icon={trashIcon} onClick={() => handleRemoveVariation(index)} />
                      <div className={styles.freeShippingContainer}>
                        <ToggleButton
                          initial={isActive}
                          onToggle={(newState) => handleChangeVariationField(index, 'active', newState)}
                        />
                        <span>{isActive ? 'Ativo' : 'Desativado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Imagens da variação */}
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
                    {varImgs.length < MAX_VARIATION_IMAGES && (
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

                  <div className={styles.flexFormInput}>
                    <CustomInput
                      title="Preço"
                      type="number"
                      value={variation.price}
                      onChange={(e) => handleChangeVariationField(index, 'price', Number(e.target.value))}
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
                      onChange={(e) => handleChangeVariationField(index, 'stock', Number(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            );
          })}

          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Atualizar Produto" type="submit" backgroundColor="#7B33E5" />
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductEditPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductEdit />
    </Suspense>
  );
};

export default ProductEditPage;
