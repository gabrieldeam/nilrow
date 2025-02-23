'use client';

import React, { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  getAllProductTemplates,
  createProductTemplate,
  updateProductTemplate,
  deleteProductTemplate,
  searchProductTemplates
} from '@/services/product/productService';

import {
  getAllCategoriesAdmin,
  getSubCategoriesByCategory,
} from '../../../services/categoryService';

import { getAllBrands } from '@/services/product/brandService';

import HeaderButton from '../../../components/UI/HeaderButton/HeaderButton';
import Modal from '../../../components/Modals/Modal/Modal';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import CustomSelect from '../../../components/UI/CustomSelect/CustomSelect';
import StageButton from '../../../components/UI/StageButton/StageButton';
import { ProductTemplateDTO } from '@/types/services/product';

import closeIcon from '../../../../public/assets/close.svg';

import styles from './templateBrand.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

function ProductTemplatePage() {
  const [productTemplates, setProductTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  
  // Estados para seleção de categorias, subcategorias e marcas
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [netWeight, setNetWeight] = useState<number>(0);
  const [grossWeight, setGrossWeight] = useState<number>(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('');
  const [itemsPerBox, setItemsPerBox] = useState<number>(0);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [categoryPage, setCategoryPage] = useState(0);
  const [brandPage, setBrandPage] = useState(0);
  const [subCategoryPage, setSubCategoryPage] = useState(0);
  const [hasMoreCategories, setHasMoreCategories] = useState(true);
  const [hasMoreBrands, setHasMoreBrands] = useState(true);
  const [hasMoreSubCategories, setHasMoreSubCategories] = useState(true);  

  const router = useRouter();

  // Carrega templates conforme search ou paginação
  useEffect(() => {
    if (searchTerm.trim()) {
      searchTemplates(searchTerm);
    } else {
      fetchTemplates(currentPage, pageSize);
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

  const loadMoreCategories = async () => {
    const nextPage = categoryPage + 1;
    try {
      const cats = await getAllCategoriesAdmin(nextPage, 10);
      setCategories(prev => [...prev, ...cats.content]);
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
      setBrands(prev => [...prev, ...brs.content]);
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
      setSubCategories(prev => [...prev, ...subCats.content]);
      setHasMoreSubCategories(!subCats.last);
      setSubCategoryPage(nextPage);
    } catch (error) {
      console.error('Error loading more subcategories:', error);
    }
  };

  // Quando uma categoria for selecionada, busca suas subcategorias
  async function fetchSubCategories(catId: string, page: number = 0) {
    try {
      const subCats = await getSubCategoriesByCategory(catId, page, 10);
      if (page === 0) {
        setSubCategories(subCats.content); // Resetar na primeira página
      } else {
        setSubCategories(prev => [...prev, ...subCats.content]); // Adicionar resultados
      }
      setHasMoreSubCategories(!subCats.last);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  }

  async function fetchTemplates(page: number, size: number) {
    try {
      const data = await getAllProductTemplates();
      setProductTemplates(data);
      setTotalPages(Math.ceil(data.length / pageSize));
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  }

  async function searchTemplates(name: string) {
    try {
      const result = await searchProductTemplates(name, currentPage, pageSize);
      setProductTemplates(result.content);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error searching templates:', error);
    }
  }

  function handleNextPage() {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  function handlePreviousPage() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleTemplateClick(template: any) {
    setSelectedTemplate(template);
    setNewTemplateName(template.name);
    setCategoryId(template.categoryId);
    setSubCategoryId(template.subCategoryId);
    setBrandId(template.brandId);
    setNetWeight(template.netWeight);
    setGrossWeight(template.grossWeight);
    setUnitOfMeasure(template.unitOfMeasure);
    setItemsPerBox(template.itemsPerBox);
    setImagePreviews(template.images.map((img: string) => `${apiUrl}${img}`));
    setIsModalOpen(true);
  }

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
    setIsModalOpen(false);
  }

  async function handleCreateTemplate() {
    try {
      const newTemplate: ProductTemplateDTO = {
        name: newTemplateName,
        categoryId,
        subCategoryId,
        brandId,
        netWeight,
        grossWeight,
        unitOfMeasure,
        itemsPerBox,
        variations: [],
        images: [],
        id: "" // valor temporário, que será removido
      };
  
      // Se houver imagens, converte para base64 e atribui
      if (newImages && newImages.length > 0) {
        const imagePromises = newImages.map(file =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
        );
        newTemplate.images = await Promise.all(imagePromises);
      }
  
      // Remover a propriedade "id" antes de enviar
      const { id, ...templateWithoutId } = newTemplate;
      await createProductTemplate(templateWithoutId as unknown as ProductTemplateDTO);
      fetchTemplates(currentPage, pageSize);
      clearModal();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  }
  
  
  

  async function handleUpdateTemplate() {
    try {
      if (selectedTemplate) {
        const updatedTemplate = {
          ...selectedTemplate,
          name: newTemplateName,
          categoryId,
          subCategoryId,
          brandId,
          netWeight,
          grossWeight,
          unitOfMeasure,
          itemsPerBox
        };
        
        await updateProductTemplate(selectedTemplate.id, updatedTemplate);
        fetchTemplates(currentPage, pageSize);
        clearModal();
      }
    } catch (error) {
      console.error('Error updating template:', error);
    }
  }

  async function handleDeleteTemplate() {
    try {
      if (selectedTemplate) {
        await deleteProductTemplate(selectedTemplate.id);
        fetchTemplates(currentPage, pageSize);
        clearModal();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
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

  const isFormValid = newTemplateName.trim() !== '' &&
    categoryId.trim() !== '' &&
    brandId.trim() !== '' &&
    netWeight > 0 &&
    grossWeight > 0 &&
    unitOfMeasure.trim() !== '' &&
    itemsPerBox > 0;

  return (
    <div className={styles['category-page']}>
      <Head>
        <title>Manage Product Templates</title>
        <meta name="description" content="Product Templates Management" />
      </Head>

      <div className={styles['category-container']}>
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

        <div className={styles['category-section']}>
          <div className={styles['category-list']}>
            <div className={styles['category-header']}>
              <div className={styles['category-columnindex']}>#</div>
              <div className={styles['category-columnimage']}>Image</div>
              <div className={styles['category-columnname']}>Name</div>
            </div>

            {productTemplates.map((template, index) => {
              const isSelected = selectedTemplate?.id === template.id;
              const backgroundColor = isSelected
                ? '#414141'
                : index % 2 === 0
                ? '#0B0B0B'
                : 'black';

              return (
                <div
                  key={template.id}
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
                          <img
                            src={`${apiUrl}${template.images[0]}`}
                            alt={template.name}
                            className={styles['category-image']}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles['category-columnname']}>
                    {template.name}
                  </div>
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
            <button
              onClick={handleNextPage}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </button>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={clearModal}>
          <div className={styles['category-form']}>
            <h3 className={styles['category-title-form']}>
              {selectedTemplate ? 'Edit Template' : 'New Template'}
            </h3>

            <CustomInput
              title="Template Name"
              type="text"
              name="name"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
            />

            <CustomSelect
                title="Category"
                placeholder="Select a category"
                value={categoryId}
                name="category"
                onChange={(e) => {
                    setCategoryId(e.target.value);
                    setSubCategoryPage(0); // Resetar paginação ao mudar categoria
                    fetchSubCategories(e.target.value, 0);
                }}
                options={categories.map((cat: any) => ({ value: cat.id, label: cat.name }))}
                onLoadMore={loadMoreCategories}
                hasMore={hasMoreCategories}
            />

            <CustomSelect
                title="Subcategory"
                placeholder="Select a subcategory"
                value={subCategoryId}
                name="subcategory"
                onChange={(e) => setSubCategoryId(e.target.value)}
                options={subCategories.map((sub: any) => ({ value: sub.id, label: sub.name }))}
                onLoadMore={loadMoreSubCategories}
                hasMore={hasMoreSubCategories}
            />

            <CustomSelect
                title="Brand"
                placeholder="Select a brand"
                value={brandId}
                name="brand"
                onChange={(e) => setBrandId(e.target.value)}
                options={brands.map((b: any) => ({ value: b.id, label: b.name }))}
                onLoadMore={loadMoreBrands}
                hasMore={hasMoreBrands}
            />

            <CustomInput
              title="Net Weight"
              type="number"
              name="netWeight"
              value={netWeight}
              onChange={(e) => setNetWeight(Number(e.target.value))}
            />

            <CustomInput
              title="Gross Weight"
              type="number"
              name="grossWeight"
              value={grossWeight}
              onChange={(e) => setGrossWeight(Number(e.target.value))}
            />

            <CustomInput
              title="Unit of Measure"
              type="text"
              name="unitOfMeasure"
              value={unitOfMeasure}
              onChange={(e) => setUnitOfMeasure(e.target.value)}
            />

            <CustomInput
              title="Items per Box"
              type="number"
              name="itemsPerBox"
              value={itemsPerBox}
              onChange={(e) => setItemsPerBox(Number(e.target.value))}
            />

            {!selectedTemplate && (
              <div className={styles['add-channel-image-upload']}>
                <div className={styles['image-previews-container']}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={styles['category-image-circle']}>
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
                    <label
                      htmlFor="template-images"
                      className={styles['add-channel-upload-button']}
                    >
                      Choose Files
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
                <p>Maximum 5 images allowed</p>
              </div>
            )}

            {selectedTemplate && (
              <div className={styles['image-previews-container']}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} className={styles['category-image-circle']}>
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      width={50}
                      height={50}
                      className={styles['category-image-preview']}
                    />
                  </div>
                ))}
              </div>
            )}

            <div className={styles['modal-buttons']}>
              {selectedTemplate ? (
                <>
                  <StageButton
                    text="Update"
                    backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                    onClick={handleUpdateTemplate}
                    disabled={!isFormValid}
                  />
                  <StageButton
                    text="Delete"
                    backgroundColor="#DF1414"
                    onClick={handleDeleteTemplate}
                  />
                </>
              ) : (
                <StageButton
                  text="Create"
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
