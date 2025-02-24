'use client';

import React, { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  getAllProductTemplates,
  getProductTemplateById, 
  createProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
  searchProductTemplates,
} from '@/services/product/productTemplateService';

import {
  getAllCategoriesAdmin,
  getSubCategoriesByCategory,
} from '@/services/categoryService';

import { getAllBrands } from '@/services/product/brandService';

import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';
import Modal from '@/components/Modals/Modal/Modal';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import CustomSelect from '@/components/UI/CustomSelect/CustomSelect';
import StageButton from '@/components/UI/StageButton/StageButton';
import { ProductTemplateDTO } from '@/types/services/productTemplate';

import closeIcon from '@/../public/assets/close.svg';

import styles from './templateBrand.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// -------------------------------------------------------
// Tipo para os templates associados durante criação/edição.
// Incluímos 'images?' opcional para não quebrar o payload.
type AssociatedTemplateInput = Omit<ProductTemplateDTO, 'id' | 'images'> & {
  id?: string;                   // Se já existe no BD
  uploadedImages?: File[];       // Arquivos enviados para upload
  isRemoved?: boolean;           // Marca se o usuário removeu esse associado
  images?: string[];             // Para compatibilidade com o DTO (default: [])
};

// -------------------------------------------------------
// Função para montar a hierarquia de templates (pai/filhos)
function buildTemplateHierarchy(productTemplates: ProductTemplateDTO[]) {
  const templateMap = new Map<string, ProductTemplateDTO>();
  productTemplates.forEach((t) => templateMap.set(t.id, t));

  const childIds = new Set<string>();
  productTemplates.forEach((t) => {
    if (t.associatedTemplateIds && t.associatedTemplateIds.length > 0) {
      t.associatedTemplateIds.forEach((childId) => childIds.add(childId));
    }
  });

  const roots = productTemplates.filter((t) => !childIds.has(t.id));

  const hierarchy = roots.map((root) => {
    const children = (root.associatedTemplateIds || [])
      .map((childId) => templateMap.get(childId))
      .filter((child) => child !== undefined) as ProductTemplateDTO[];
    return {
      template: root,
      children,
    };
  });

  return hierarchy;
}

function ProductTemplatePage() {
  // --- Estados Principais ---
  const [productTemplates, setProductTemplates] = useState<ProductTemplateDTO[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplateDTO | null>(null);

  // Estado para os templates associados (filhos) a serem editados/criados
  const [associatedTemplatesData, setAssociatedTemplatesData] = useState<AssociatedTemplateInput[]>([]);

  // Campos do template principal
  const [newTemplateName, setNewTemplateName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [netWeight, setNetWeight] = useState<number>(0);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [itemsPerBox, setItemsPerBox] = useState<number>(0);

  // Imagens do template principal
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Listas de categorias, subcategorias, marcas
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);

  // Busca e Paginação
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;

  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginação adicional para listas externas
  const [categoryPage, setCategoryPage] = useState(0);
  const [brandPage, setBrandPage] = useState(0);
  const [subCategoryPage, setSubCategoryPage] = useState(0);

  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(true);

  const router = useRouter();

  // -----------------------------------------------------
  // Effects para busca e carregamento inicial
  // -----------------------------------------------------
  useEffect(() => {
    if (searchTerm.trim()) {
      searchTemplates(searchTerm, currentPage, pageSize);
    } else {
      fetchTemplates();
    }
  }, [searchTerm, currentPage]);

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
        console.error('Error fetching initial data:', error);
      }
    }
    fetchInitialData();
  }, []);

  async function fetchTemplates() {
    try {
      const data = await getAllProductTemplates();
      setProductTemplates(data);
      setTotalPages(Math.ceil(data.length / pageSize));
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }

  async function searchTemplates(name: string, page: number, size: number) {
    try {
      const result = await searchProductTemplates(name, page, size);
      setProductTemplates(result.content);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error searching templates:', error);
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  }
  function handlePreviousPage() {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  }

  const loadMoreCategories = async () => {
    const nextPage = categoryPage + 1;
    try {
      const cats = await getAllCategoriesAdmin(nextPage, 10);
      setCategories((prev) => [...prev, ...cats.content]);
      setHasMoreCategories(!cats.last);
      setCategoryPage(nextPage);
    } catch (error) {
      console.error('Error loading more categories:', error);
    }
  };

  const loadMoreBrands = async () => {
    const nextPage = brandPage + 1;
    try {
      const brs = await getAllBrands(nextPage, 10);
      setBrands((prev) => [...prev, ...brs.content]);
      setHasMoreBrands(!brs.last);
      setBrandPage(nextPage);
    } catch (error) {
      console.error('Error loading more brands:', error);
    }
  };

  const loadMoreSubCategories = async () => {
    if (!categoryId) return;
    const nextPage = subCategoryPage + 1;
    try {
      const subCats = await getSubCategoriesByCategory(categoryId, nextPage, 10);
      setSubCategories((prev) => [...prev, ...subCats.content]);
      setHasMoreSubCategories(!subCats.last);
      setSubCategoryPage(nextPage);
    } catch (error) {
      console.error('Error loading more subcategories:', error);
    }
  };

  async function fetchSubCategories(catId: string, page = 0) {
    try {
      const subCats = await getSubCategoriesByCategory(catId, page, 10);
      if (page === 0) {
        setSubCategories(subCats.content);
      } else {
        setSubCategories((prev) => [...prev, ...subCats.content]);
      }
      setHasMoreSubCategories(!subCats.last);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  }

  // -----------------------------------------------------
  // Função para buscar filhos (associados) pelo ID
  // -----------------------------------------------------
  async function fetchChildTemplatesByIds(childIds: string[]): Promise<ProductTemplateDTO[]> {
    const results: ProductTemplateDTO[] = [];
    for (const cid of childIds) {
      const childTemplate = await getProductTemplateById(cid);
      results.push(childTemplate);
    }
    return results;
  }

  // -----------------------------------------------------
  // Ações do Modal - CRIAÇÃO / EDIÇÃO
  // -----------------------------------------------------
  function openCreateModal() {
    setSelectedTemplate(null);
    setNewTemplateName('');
    setCategoryId('');
    setSubCategoryId('');
    setBrandId('');
    setNetWeight(0);
    setGrossWeight(0);
    setUnitOfMeasure('');
    setItemsPerBox(0);
    setNewImages([]);
    setImagePreviews([]);
    setAssociatedTemplatesData([]);
    setIsModalOpen(true);
  }

  // Ao clicar num template (para edição), carrega os dados do pai e dos filhos
  async function handleTemplateClick(template: ProductTemplateDTO) {
    setSelectedTemplate(template);
    setNewTemplateName(template.name);
    setCategoryId(template.categoryId);
    setSubCategoryId(template.subCategoryId);
    setBrandId(template.brandId);
    setNetWeight(template.netWeight);
    setGrossWeight(template.grossWeight);
    setUnitOfMeasure(template.unitOfMeasure);
    setItemsPerBox(template.itemsPerBox);

    const childIds = template.associatedTemplateIds || [];
    if (childIds.length > 0) {
      const childTemplates = await fetchChildTemplatesByIds(childIds);
      const assocData: AssociatedTemplateInput[] = childTemplates.map((child) => ({
        id: child.id,
        name: child.name,
        categoryId: child.categoryId,
        subCategoryId: child.subCategoryId,
        brandId: child.brandId,
        netWeight: child.netWeight,
        grossWeight: child.grossWeight,
        unitOfMeasure: child.unitOfMeasure,
        itemsPerBox: child.itemsPerBox,
        associatedTemplateIds: child.associatedTemplateIds || [],
        productsId: child.productsId || [],
        uploadedImages: [],
        isRemoved: false,
        images: child.images, // Preserva as imagens (string[]) do filho
      }));
      setAssociatedTemplatesData(assocData);
    } else {
      setAssociatedTemplatesData([]);
    }

    const oldImages = template.images?.map((img) => `${apiUrl}${img}`) || [];
    setImagePreviews(oldImages);
    setNewImages([]);
    setIsModalOpen(true);
  }

  function clearModal() {
    setSelectedTemplate(null);
    setNewTemplateName('');
    setCategoryId('');
    setSubCategoryId('');
    setBrandId('');
    setNetWeight(0);
    setGrossWeight(0);
    setUnitOfMeasure('');
    setItemsPerBox(0);
    setNewImages([]);
    setImagePreviews([]);
    setAssociatedTemplatesData([]);
    setIsModalOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files) {
      const validFiles: File[] = [];
      const previews: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith('image/')) {
          validFiles.push(file);
          previews.push(URL.createObjectURL(file));
          if (validFiles.length >= 5) break;
        }
      }
      if (validFiles.length > 0) {
        setNewImages(validFiles);
        setImagePreviews(previews);
      } else {
        alert('Please select valid image files.');
      }
    }
  }

  // Atualiza um campo de um template associado
  function updateAssociationField(index: number, field: keyof AssociatedTemplateInput, value: any) {
    setAssociatedTemplatesData((prev) => {
      const newArr = [...prev];
      newArr[index] = {
        ...newArr[index],
        [field]: value,
      };
      return newArr;
    });
  }

  // Upload de imagem para um template associado
  function handleAssociationFileChange(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      updateAssociationField(index, 'uploadedImages', fileArray);
    }
  }

  // Adiciona um novo template associado (para criação ou edição)
  function handleAddAssociation() {
    const assocData: AssociatedTemplateInput = {
      id: undefined,
      name: newTemplateName + ' (Associado)',
      categoryId,
      subCategoryId,
      brandId,
      netWeight,
      grossWeight,
      unitOfMeasure,
      itemsPerBox,
      associatedTemplateIds: [],
      productsId: [],
      uploadedImages: [],
      isRemoved: false,
      images: [], // Define default como vazio
    };
    setAssociatedTemplatesData((prev) => [...prev, assocData]);
  }

  // Remove um template associado: se já existir, marca para remoção; se novo, remove do array
  function removeAssociation(index: number) {
    setAssociatedTemplatesData((prev) => {
      const newArr = [...prev];
      const item = newArr[index];
      if (item.id) {
        item.isRemoved = true;
      } else {
        newArr.splice(index, 1);
      }
      return newArr;
    });
  }

  // -----------------------------------------------------
  // CRUD: Criar template (pai e filhos novos)
  // -----------------------------------------------------
  async function handleCreateTemplate() {
    try {
      // 1) Cria o template principal
      const mainTemplateData: Omit<ProductTemplateDTO, 'id'> = {
        name: newTemplateName,
        categoryId,
        subCategoryId,
        brandId,
        netWeight,
        grossWeight,
        unitOfMeasure,
        itemsPerBox,
        associatedTemplateIds: [],
        images: [],
        productsId: [],
      };
      const mainTemplate = await createProductTemplate(mainTemplateData, newImages);

      // 2) Cria cada template associado (filho) e coleta seus IDs
      const createdAssociatedIds: string[] = [];
      for (const assocData of associatedTemplatesData) {
        if (assocData.isRemoved) continue;
        const payload: Omit<ProductTemplateDTO, 'id'> = {
          ...assocData,
          images: assocData.images || [],
          productsId: assocData.productsId || [],
        };
        const createdAssoc = await createProductTemplate(payload, assocData.uploadedImages || []);
        createdAssociatedIds.push(createdAssoc.id);
      }

      // 3) Atualiza o template principal com a lista de IDs dos filhos
      if (createdAssociatedIds.length > 0) {
        const updatedMainTemplate: ProductTemplateDTO = {
          ...mainTemplate,
          associatedTemplateIds: createdAssociatedIds,
        };
        await updateProductTemplate(mainTemplate.id, updatedMainTemplate, undefined);
      }

      fetchTemplates();
      clearModal();
    } catch (error) {
      alert('Erro ao criar template e associações');
    }
  }

  // -----------------------------------------------------
  // CRUD: Atualizar template (pai e processar filhos)
  // -----------------------------------------------------
  async function handleUpdateTemplate() {
    if (!selectedTemplate) return;

    try {
      // 1) Atualiza o template principal (pai)
      const updatedTemplate: ProductTemplateDTO = {
        ...selectedTemplate,
        name: newTemplateName,
        categoryId,
        subCategoryId,
        brandId,
        netWeight,
        grossWeight,
        unitOfMeasure,
        itemsPerBox,
      };

      const updatedParent = await updateProductTemplate(
        selectedTemplate.id,
        updatedTemplate,
        newImages.length > 0 ? newImages : undefined
      );

      // 2) Processa cada template associado (filho)
      const finalChildIds: string[] = [];
      for (const assoc of associatedTemplatesData) {
        if (assoc.isRemoved && assoc.id) {
          await deleteProductTemplate(assoc.id);
          continue;
        }
        if (assoc.isRemoved && !assoc.id) {
          continue;
        }
        if (assoc.id) {
          const updateChildDTO: ProductTemplateDTO = {
            ...assoc,
            id: assoc.id,
            images: assoc.images || [],
            productsId: assoc.productsId || [],
          };
          await updateProductTemplate(
            assoc.id,
            updateChildDTO,
            assoc.uploadedImages && assoc.uploadedImages.length > 0 ? assoc.uploadedImages : undefined
          );
          finalChildIds.push(assoc.id);
        } else {
          const payload: Omit<ProductTemplateDTO, 'id'> = {
            ...assoc,
            images: assoc.images || [],
            productsId: assoc.productsId || [],
          };
          const created = await createProductTemplate(payload, assoc.uploadedImages || []);
          finalChildIds.push(created.id);
        }
      }

      // 3) Atualiza o template principal com a lista final de IDs dos filhos
      const finalParent: ProductTemplateDTO = {
        ...updatedParent,
        associatedTemplateIds: finalChildIds,
      };
      await updateProductTemplate(updatedParent.id, finalParent, undefined);

      fetchTemplates();
      clearModal();
    } catch (error) {
      alert('Erro ao atualizar template e associações');
    }
  }

  // -----------------------------------------------------
  // CRUD: Deletar template (pai ou filho)
  // -----------------------------------------------------
  async function handleDeleteTemplate() {
    if (!selectedTemplate) return;
    try {
      await deleteProductTemplate(selectedTemplate.id);
      fetchTemplates();
      clearModal();
    } catch (error) {
      alert('Erro ao excluir template. Veja console para detalhes.');
    }
  }

  // -----------------------------------------------------
  // Validação Simples
  // -----------------------------------------------------
  const isFormValid =
    newTemplateName.trim() !== '' &&
    categoryId.trim() !== '' &&
    brandId.trim() !== '' &&
    netWeight > 0 &&
    grossWeight > 0 &&
    unitOfMeasure.trim() !== '' &&
    itemsPerBox > 0;

  // -----------------------------------------------------
  // Monta a Hierarquia (pai/filhos) para exibição
  // -----------------------------------------------------
  const templateHierarchy = buildTemplateHierarchy(productTemplates);

  // -----------------------------------------------------
  // Renderização
  // -----------------------------------------------------
  return (
    <div className={styles['category-page']}>
      <Head>
        <title>Manage Product Templates</title>
        <meta name="description" content="Product Templates Management" />
      </Head>

      <div className={styles['category-container']}>
        {/* Barra de Pesquisa + Botão de Criação */}
        <div className={styles['category-search-container']}>
          <HeaderButton onClick={() => router.back()} icon={closeIcon} />
          <input
            type="text"
            placeholder="Search by template name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles['category-search-input']}
          />
          <button onClick={openCreateModal} className={styles['add-category-btn']}>
            + Add Template
          </button>
        </div>

        {/* Listagem Hierárquica */}
        <div className={styles['category-section']}>
          <div className={styles['category-list']}>
            <div className={styles['category-header']}>
              <div className={styles['category-columnindex']}>#</div>
              <div className={styles['category-columnimage']}>Image</div>
              <div className={styles['category-columnname']}>Name</div>
            </div>

            {templateHierarchy.map((group, index) => {
              const template = group.template;
              const children = group.children;
              const isSelected = selectedTemplate?.id === template.id;
              const backgroundColor = isSelected
                ? '#414141'
                : index % 2 === 0
                ? '#0B0B0B'
                : 'black';

              return (
                <div key={template.id} style={{ marginBottom: '20px' }}>
                  {/* Template Pai */}
                  <div
                    className={`${styles['category-row']} ${isSelected ? styles['selected'] : ''}`}
                    onClick={() => handleTemplateClick(template)}
                    style={{ backgroundColor, height: '57px', cursor: 'pointer' }}
                  >
                    <div className={styles['category-columnindex']}>
                      {index + 1 + currentPage * pageSize}
                    </div>
                    <div className={styles['category-columnimage']}>
                      <div className={styles['category-image-wrapper']}>
                        <div className={styles['category-image-circle']}>
                          {template.images?.[0] && (
                            <Image
                              src={`${apiUrl}${template.images[0]}`}
                              alt={template.name}
                              className={styles['category-image']}
                              width={50}
                              height={50}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={styles['category-columnname']}>{template.name}</div>
                  </div>

                  {/* Templates Associados */}
                  {children && children.length > 0 && (
                    <div style={{ marginLeft: '40px', marginTop: '5px' }}>
                      {children.map((child, cIndex) => {
                        const isChildSelected = selectedTemplate?.id === child.id;
                        const childBg = isChildSelected ? '#414141' : '#1A1A1A';
                        return (
                          <div
                            key={child.id}
                            className={`${styles['category-row']} ${isChildSelected ? styles['selected'] : ''}`}
                            onClick={() => handleTemplateClick(child)}
                            style={{ backgroundColor: childBg, height: '50px', cursor: 'pointer', marginBottom: '5px' }}
                          >
                            <div className={styles['category-columnindex']}>
                              {`${index + 1}.${cIndex + 1}`}
                            </div>
                            <div className={styles['category-columnimage']}>
                              <div className={styles['category-image-wrapper']}>
                                <div className={styles['category-image-circle']}>
                                  {child.images?.[0] && (
                                    <Image
                                      src={`${apiUrl}${child.images[0]}`}
                                      alt={child.name}
                                      className={styles['category-image']}
                                      width={40}
                                      height={40}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className={styles['category-columnname']}>
                              {child.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={styles['pagination-controls']}>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              Previous
            </button>
            <span>
              Page {currentPage + 1} of {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
              Next
            </button>
          </div>
        </div>

        {/* MODAL: Criar / Editar Template (pai e associados) */}
        <Modal isOpen={isModalOpen} onClose={clearModal}>
          <div className={styles['category-form']}>
            <h3 className={styles['category-title-form']}>
              {selectedTemplate ? 'Editando Template Existente' : 'Criando Novo Template'}
            </h3>

            {/* Imagens do Template Pai */}
            {!selectedTemplate && (
              <div className={styles['add-channel-image-upload']}>
                <div className={styles['image-previews-container']}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={styles.createImage}>
                      <Image
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        width={50}
                        height={50}
                        className={styles['category-image-preview']}
                      />
                    </div>
                  ))}
                  {imagePreviews.length < 5 && (
                    <label htmlFor="template-images" className={styles['add-channel-upload-button']}>
                      + Adicionar imagens
                      <input
                        type="file"
                        id="template-images"
                        name="images"
                        onChange={handleFileChange}
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
                <p className={styles.infoImagens}>Máximo de 5 imagens permitidas</p>
              </div>
            )}

            {selectedTemplate && (
              <div className={styles['image-previews-container']}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles.createImage}>
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={50}
                      height={50}
                      className={styles['category-image-preview']}
                    />
                  </div>
                ))}
                {imagePreviews.length < 5 && (
                  <label htmlFor="template-images-update" className={styles['add-channel-upload-button']}>
                    Substituir Imagens
                    <input
                      type="file"
                      id="template-images-update"
                      name="images"
                      onChange={handleFileChange}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
                <p className={styles.infoImagens}>O upload de novas imagens substituirá as existentes.</p>
              </div>
            )}

            {/* Campos do Template Pai */}
            <CustomInput
              title="Nome do Template"
              type="text"
              name="name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />
            <CustomSelect
              title="Categoria"
              placeholder="Selecione uma categoria"
              value={categoryId}
              name="category"
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryPage(0);
                fetchSubCategories(e.target.value, 0);
              }}
              options={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))}
              onLoadMore={loadMoreCategories}
              hasMore={hasMoreCategories}
            />
            <CustomSelect
              title="Subcategoria"
              placeholder="Selecione uma subcategoria"
              value={subCategoryId}
              name="subcategory"
              onChange={(e) => setSubCategoryId(e.target.value)}
              options={subCategories.map((sub: any) => ({ value: sub.id, label: sub.name }))}
              onLoadMore={loadMoreSubCategories}
              hasMore={hasMoreSubCategories}
            />
            <CustomSelect
              title="Marca"
              placeholder="Selecione uma marca"
              value={brandId}
              name="brand"
              onChange={(e) => setBrandId(e.target.value)}
              options={brands.map((b: any) => ({ value: b.id, label: b.name }))}
              onLoadMore={loadMoreBrands}
              hasMore={hasMoreBrands}
            />
            <CustomInput
              title="Peso líquido"
              type="number"
              name="netWeight"
              value={netWeight}
              onChange={(e) => setNetWeight(Number(e.target.value))}
            />
            <CustomInput
              title="Peso bruto"
              type="number"
              name="grossWeight"
              value={grossWeight}
              onChange={(e) => setGrossWeight(Number(e.target.value))}
            />
            <CustomInput
              title="Unidade de Medida"
              type="text"
              name="unitOfMeasure"
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value)}
            />
            <CustomInput
              title="Itens por caixa"
              type="number"
              name="itemsPerBox"
              value={itemsPerBox}
              onChange={(e) => setItemsPerBox(Number(e.target.value))}
            />

            {/* Seção de Templates Associados (exibida tanto na criação quanto na edição) */}
            <div className={styles['association-section']}>
              <h4>Templates Associados</h4>
              <p className={styles['association-helper']}>
                Edite os templates associados ou adicione novos.
              </p>
              <button onClick={handleAddAssociation} className={styles['add-association-btn']}>
                Adicionar Template Associado
              </button>

              {associatedTemplatesData.map((assoc, index) => {
                if (assoc.isRemoved) return null;
                return (
                  <div key={index} className={styles['association-item']}>
                    <div className={styles['association-item-header']}>
                      <span className={styles['association-title']}>
                        {assoc.id ? `Filho Existente` : `Novo Filho (#${index + 1})`}
                      </span>
                      <button
                        onClick={() => removeAssociation(index)}
                        className={styles['remove-association-button']}
                      >
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
                        title="Peso Líquido"
                        type="number"
                        name={`assoc-netWeight-${index}`}
                        value={assoc.netWeight}
                        onChange={(e) => updateAssociationField(index, 'netWeight', Number(e.target.value))}
                      />
                      <CustomInput
                        title="Peso Bruto"
                        type="number"
                        name={`assoc-grossWeight-${index}`}
                        value={assoc.grossWeight}
                        onChange={(e) => updateAssociationField(index, 'grossWeight', Number(e.target.value))}
                      />
                      <CustomInput
                        title="Itens por Caixa"
                        type="number"
                        name={`assoc-itemsPerBox-${index}`}
                        value={assoc.itemsPerBox}
                        onChange={(e) => updateAssociationField(index, 'itemsPerBox', Number(e.target.value))}
                      />
                      <div className={styles['association-image-upload']}>
                        <label htmlFor={`assoc-images-${index}`} className={styles['add-channel-upload-button']}>
                          + Adicionar Imagem
                          <input
                            type="file"
                            id={`assoc-images-${index}`}
                            name={`assoc-images-${index}`}
                            onChange={(ev) => handleAssociationFileChange(ev, index)}
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                          />
                        </label>
                        {(assoc.uploadedImages && assoc.uploadedImages.length > 0) ? (
                          <div className={styles['association-image-preview']}>
                            {assoc.uploadedImages.map((file, idx) => (
                              <Image
                                key={idx}
                                src={URL.createObjectURL(file)}
                                alt={`Assoc Preview ${idx + 1}`}
                                width={50}
                                height={50}
                                className={styles.createImage}
                              />
                            ))}
                          </div>
                        ) : (assoc.images && assoc.images.length > 0) ? (
                          <div className={styles['association-image-preview']}>
                            {assoc.images.map((img, idx) => (
                              <Image
                                key={idx}
                                src={`${apiUrl}${img}`}
                                alt={`Assoc Image ${idx + 1}`}
                                width={50}
                                height={50}
                                className={styles.createImage}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Botões do Modal */}
            <div className={styles['modal-buttons']}>
              {selectedTemplate ? (
                <>
                  <StageButton
                    text="Atualizar"
                    backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                    onClick={handleUpdateTemplate}
                    disabled={!isFormValid}
                  />
                  <StageButton
                    text="Excluir"
                    backgroundColor="#DF1414"
                    onClick={handleDeleteTemplate}
                  />
                </>
              ) : (
                <StageButton
                  text="Criar Template"
                  backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                  onClick={handleCreateTemplate}
                  disabled={!isFormValid}
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default memo(ProductTemplatePage);