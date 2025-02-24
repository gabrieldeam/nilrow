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

import { createProduct /*, updateProduct */ } from '@/services/product/productService';
import { ProductDTO, ProductType, ProductCondition, ProductionType } from '@/types/services/product';

import defaultImage from '../../../../../../../public/assets/user.png';
import styles from './addProduct.module.css';

// Tipo para armazenar imagens do produto principal
interface ImageData {
  file: File;
  preview: string;
}

// Tipo para os produtos associados
// (Utilizamos os mesmos campos do ProductDTO, exceto id, images e associated que serão tratados separadamente)
interface AssociatedProductInput extends Omit<ProductDTO, 'id' | 'images' | 'associated'> {
  id?: string;               // Se já existir no BD
  uploadedImages?: File[];   // Imagens para upload
  isRemoved?: boolean;       // Marcação para remoção
  images?: string[];         // Caso existam imagens já salvas
}

const ProductCreatePage: React.FC = () => {
  const router = useRouter();
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Estado para imagens do produto principal
  const [images, setImages] = useState<ImageData[]>([]);

  // Estados dos campos básicos do produto principal
  const [name, setName] = useState('');
  const [skuCode, setSkuCode] = useState('');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.PRODUCT);
  const [condition, setCondition] = useState<ProductCondition>(ProductCondition.NEW);
  const [productionType, setProductionType] = useState<ProductionType>(ProductionType.OWN);
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

  // IDs de exemplo
  const [catalogId, setCatalogId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');

  // Estado para os produtos associados
  const [associations, setAssociations] = useState<AssociatedProductInput[]>([]);

  // -- Funções para o upload de imagens do produto principal --
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const availableSlots = 5 - images.length;
      if (newFiles.length > availableSlots) {
        alert('Você pode enviar no máximo 5 imagens.');
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
      URL.revokeObjectURL(removed.preview); // Libera memória
      return newImages;
    });
  };

  // -- Funções para manipular produtos associados --

  // Adiciona uma associação copiando os dados atuais do produto principal
  const handleAddAssociation = () => {
    const newAssoc: AssociatedProductInput = {
      catalogId, // usando o estado do produto principal
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
      expirationDate: null, // ou outro valor padrão, se necessário
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
  
  

  // Atualiza um campo de um associado
  const updateAssociationField = (index: number, field: keyof AssociatedProductInput, value: any) => {
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
      // Se o associado já tiver um id, podemos marcar como removido
      if (newArr[index].id) {
        newArr[index].isRemoved = true;
      } else {
        newArr.splice(index, 1);
      }
      return newArr;
    });
  };

  // -- Função de envio do formulário --
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
        expirationDate: null,
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
        associated: [], // Aqui serão armazenados os IDs dos produtos associados
      };

      try {
        // 1. Cria o produto principal
        const createdMain = await createProduct(newProduct, images.map((img) => img.file));
        console.log('Produto principal criado', createdMain);

        // 2. Cria os produtos associados (se houver)
        const associatedIds: string[] = [];
        for (const assoc of associations) {
          if (assoc.isRemoved) continue;
          // Aqui você pode adaptar a lógica: o associado pode ter campos editados
          // Se desejar, remova campos desnecessários ou faça merge com o produto principal
          const assocPayload: ProductDTO = {
            id: '',
            catalogId,
            images: [],
            name: assoc.name,
            skuCode: assoc.skuCode,
            salePrice: assoc.salePrice,
            discountPrice: assoc.discountPrice,
            unitOfMeasure: assoc.unitOfMeasure,
            type: assoc.type,
            condition: assoc.condition,
            categoryId,
            subCategoryId,
            brandId,
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
            active: true,
            associated: [],
          };

          const createdAssoc = await createProduct(assocPayload, assoc.uploadedImages || []);
          console.log('Produto associado criado', createdAssoc);
          associatedIds.push(createdAssoc.id);
        }

        // 3. Atualiza o produto principal com os IDs dos associados, se necessário.
        // Exemplo: se você possuir uma função updateProduct, poderia chamar:
        // await updateProduct(createdMain.id, { ...createdMain, associated: associatedIds });
        // Neste exemplo, apenas exibimos no console.
        console.log('IDs dos produtos associados:', associatedIds);

        router.push('/channel/catalog/my/product');
      } catch (error) {
        console.error('Erro ao criar produto:', error);
        alert('Ocorreu um erro ao criar o produto!');
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

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Produto</title>
        <meta name="description" content="Criação de Produto" />
      </Head>

      {isMobile && (
        <MobileHeader title="Produto" buttons={{ close: true }} handleBack={() => router.push('/channel/catalog/my/product')} />
      )}

      <div className={styles.productContainer}>
        <div className={styles.productHeader}>
          <SubHeader title="Novo Produto" handleBack={() => router.push('/channel/catalog/my/product')} />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Upload de Imagens */}
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
                  <button type="button" className={styles.removeButton} onClick={() => handleRemoveImage(index)}>
                    ×
                  </button>
                </div>
              ))
            ) : (
              <Image src={defaultImage.src} alt="Preview" className={styles.addChannelImagePreview} width={70} height={70} />
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
                multiple
                style={{ display: 'none' }}
              />
              {images.length > 0 && (
                <div className={styles.fileName}>
                  {images.map((img, index) => (
                    <div key={index}>{img.file.name}</div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dados Básicos */}
          <Card title="Dados Básicos">
            <CustomInput title="Nome do Produto" type="text" name="name" value={name} onChange={(e) => setName(e.target.value)} />
            <CustomInput title="SKU" type="text" name="skuCode" value={skuCode} onChange={(e) => setSkuCode(e.target.value)} />
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
              onChange={(e) => setCondition(e.target.value as ProductCondition)}
              options={[
                { value: ProductCondition.NEW, label: 'Novo' },
                { value: ProductCondition.USED, label: 'Usado' },
                { value: ProductCondition.REFURBISHED, label: 'Recondicionado' },
              ]}
            />
          </Card>

          {/* Sobre */}
          <ExpandableCard title="Sobre" defaultExpanded={false}>
            <CustomInput
              title="Descrição Curta"
              type="text"
              name="shortDescription"
              value={shortDescription}
              isTextarea={true}
              onChange={(e) => setShortDescription(e.target.value)}
            />
            <CustomInput
              title="Descrição Complementar"
              type="text"
              name="complementaryDescription"
              value={complementaryDescription}
              isTextarea={true}
              onChange={(e) => setComplementaryDescription(e.target.value)}
            />
            <CustomInput
              title="Notas"
              type="text"
              name="notes"
              value={notes}
              isTextarea={true}
              onChange={(e) => setNotes(e.target.value)}
            />
          </ExpandableCard>

          {/* Características */}
          <ExpandableCard title="Características" defaultExpanded={false}>
            <CustomSelect
              title="Marca"
              placeholder="Selecione uma marca"
              value={brandId}
              name="brand"
              onChange={(e) => setBrandId(e.target.value)}
              options={[
                { value: 'BRAND_1', label: 'Marca 1' },
                { value: 'BRAND_2', label: 'Marca 2' },
              ]}
            />
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
            <CustomSelect
              title="Categoria"
              placeholder="Selecione uma categoria"
              value={categoryId}
              name="category"
              onChange={(e) => setCategoryId(e.target.value)}
              options={[
                { value: 'CATALOG_1', label: 'Categoria 1' },
                { value: 'CATALOG_2', label: 'Categoria 2' },
              ]}
            />
            <CustomSelect
              title="SubCategoria"
              placeholder="Selecione uma subcategoria"
              value={subCategoryId}
              name="subcategory"
              onChange={(e) => setSubCategoryId(e.target.value)}
              options={[
                { value: 'SUB_1', label: 'SubCategoria 1' },
                { value: 'SUB_2', label: 'SubCategoria 2' },
              ]}
            />
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
            <CustomInput
              title="Volumes"
              type="number"
              name="volumes"
              value={volumes}
              onChange={(e) => setVolumes(Number(e.target.value))}
            />
            <CustomInput
              title="Itens por Caixa"
              type="number"
              name="itemsPerBox"
              value={itemsPerBox}
              onChange={(e) => setItemsPerBox(Number(e.target.value))}
            />
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
            <div style={{ marginTop: '10px' }}>
              <label>
                <input type="checkbox" checked={freeShipping} onChange={(e) => setFreeShipping(e.target.checked)} />
                Frete Grátis
              </label>
            </div>
          </ExpandableCard>

          {/* Estoque */}
          <ExpandableCard title="Estoque" defaultExpanded={false}>
            <CustomInput
              title="Quantidade em Estoque"
              type="number"
              name="stock"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
            />
          </ExpandableCard>

          {/* Associações */}
          <ExpandableCard title="Associações" defaultExpanded={false}>
            <button type="button" onClick={handleAddAssociation} className={styles['add-association-btn']}>
              Adicionar Associação
            </button>
            {associations.map((assoc, index) => (
              !assoc.isRemoved && (
                <div key={index} className={styles['association-item']}>
                  <div className={styles['association-item-header']}>
                    <span className={styles['association-title']}>
                      {assoc.id ? 'Associação Existente' : `Nova Associação (#${index + 1})`}
                    </span>
                    <button type="button" onClick={() => removeAssociation(index)} className={styles['remove-association-button']}>
                      Remover
                    </button>
                  </div>
                  <div className={styles['association-fields']}>
                    <CustomInput
                      title="Nome"
                      type="text"
                      name={`assoc-name-${index}`}
                      value={assoc.name}
                      onChange={(e) => updateAssociationField(index, 'name', e.target.value)}
                    />
                    <CustomInput
                      title="SKU"
                      type="text"
                      name={`assoc-sku-${index}`}
                      value={assoc.skuCode}
                      onChange={(e) => updateAssociationField(index, 'skuCode', e.target.value)}
                    />
                    <CustomInput
                      title="Preço de Venda"
                      type="number"
                      name={`assoc-salePrice-${index}`}
                      value={assoc.salePrice}
                      onChange={(e) => updateAssociationField(index, 'salePrice', Number(e.target.value))}
                    />
                    {/* Você pode adicionar mais campos conforme necessário */}
                    <div>
                      <label>
                        {/* Exemplo de upload de imagem para associação */}
                        <input
                          type="file"
                          onChange={(ev) => {
                            if (ev.target.files) {
                              updateAssociationField(index, 'uploadedImages', Array.from(ev.target.files));
                            }
                          }}
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          id={`assoc-images-${index}`}
                        />
                        <span className={styles['add-channel-upload-button']}>+ Adicionar Imagem</span>
                      </label>
                    </div>
                  </div>
                </div>
              )
            ))}
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
