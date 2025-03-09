'use client';

import React, { useState, useEffect, memo, ChangeEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import {
  getAllCategoriesAdmin,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategoriesByCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  searchCategoriesByName
} from '../../../services/categoryService';

import HeaderButton from '../../../components/UI/HeaderButton/HeaderButton';
import Modal from '../../../components/Modals/Modal/Modal';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import StageButton from '../../../components/UI/StageButton/StageButton';
import ExternalSelect from '../../../components/UI/ExternalSelect/ExternalSelect';

import closeIcon from '../../../../public/assets/close.svg';
import defaultImage from '../../../../public/assets/user.png';

import styles from './category.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

// Interfaces para tipagem
interface Category {
  id: string;
  name: string;
  imageUrl?: string;
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface APIResponse<T> {
  content: T[];
  totalPages: number;
  last?: boolean;
}

function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategoriesByCategory, setSubCategoriesByCategory] = useState<{
    [key: string]: SubCategory[];
  }>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newSubCategoryName, setNewSubCategoryName] = useState('');
  const [newSubCategoryCategoryId, setNewSubCategoryCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (searchTerm.trim()) {
      searchCategories(searchTerm);
    } else {
      fetchCategoriesAndSubCategories(currentPage, pageSize);
    }
  }, [searchTerm, currentPage]);

  async function fetchCategoriesAndSubCategories(page: number, size: number) {
    try {
      const data: APIResponse<Category> = await getAllCategoriesAdmin(page, size);
      if (data && Array.isArray(data.content)) {
        setCategories(data.content);
        setTotalPages(data.totalPages);

        const subCategoriesMap: { [key: string]: SubCategory[] } = {};
        for (const category of data.content) {
          const subData: APIResponse<SubCategory> = await getSubCategoriesByCategory(category.id, 0, 10);
          subCategoriesMap[category.id] = subData.content;
        }
        setSubCategoriesByCategory(subCategoriesMap);
      } else {
        console.error('Unexpected API response format:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }

  async function searchCategories(name: string) {
    try {
      const result: Category[] = await searchCategoriesByName(name);
      setCategories(result);

      const subCategoriesMap: { [key: string]: SubCategory[] } = {};
      for (const category of result) {
        const subData: APIResponse<SubCategory> = await getSubCategoriesByCategory(category.id);
        subCategoriesMap[category.id] = subData.content;
      }
      setSubCategoriesByCategory(subCategoriesMap);
    } catch (error) {
      console.error('Erro ao pesquisar categorias:', error);
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

  function handleCategoryClick(category: Category) {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setImagePreview(`${apiUrl}${category.imageUrl}`);
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setSelectedCategory(null);
    setNewCategoryName('');
    setNewCategoryImage(null);
    setImagePreview(null);
    setIsModalOpen(true);
  }

  function clearModal() {
    setSelectedCategory(null);
    setNewCategoryName('');
    setNewCategoryImage(null);
    setImagePreview(null);
    setIsModalOpen(false);
  }

  async function handleCreateCategory() {
    try {
      await createCategory(newCategoryName, newCategoryImage);
      fetchCategoriesAndSubCategories(currentPage, pageSize);
      clearModal();
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
    }
  }

  async function handleUpdateCategory() {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, newCategoryName, newCategoryImage ?? undefined);
        fetchCategoriesAndSubCategories(currentPage, pageSize);
        clearModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
    }
  }

  async function handleDeleteCategory() {
    try {
      if (selectedCategory) {
        await deleteCategory(selectedCategory.id);
        fetchCategoriesAndSubCategories(currentPage, pageSize);
        clearModal();
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setNewCategoryImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      alert('Por favor, selecione um arquivo de imagem válido.');
    }
  }

  function openSubCategoryModal() {
    setSelectedSubCategory(null);
    setNewSubCategoryName('');
    setNewSubCategoryCategoryId('');
    setIsSubCategoryModalOpen(true);
  }

  function clearSubCategoryModal() {
    setSelectedSubCategory(null);
    setNewSubCategoryName('');
    setNewSubCategoryCategoryId('');
    setIsSubCategoryModalOpen(false);
  }

  function handleSubCategoryClick(subCategory: SubCategory) {
    setSelectedSubCategory(subCategory);
    setNewSubCategoryName(subCategory.name);
    setNewSubCategoryCategoryId(subCategory.categoryId);
    setIsSubCategoryModalOpen(true);
  }

  async function handleCreateSubCategory() {
    try {
      await createSubCategory({ 
        name: newSubCategoryName, 
        categoryId: newSubCategoryCategoryId 
      });
      fetchCategoriesAndSubCategories(currentPage, pageSize);
      clearSubCategoryModal();
    } catch (error) {
      console.error('Erro ao criar subcategoria:', error);
    }
  }

  async function handleUpdateSubCategory() {
    try {
      if (selectedSubCategory) {
        await updateSubCategory(selectedSubCategory.id, {
          name: newSubCategoryName,
          categoryId: newSubCategoryCategoryId
        });
        fetchCategoriesAndSubCategories(currentPage, pageSize);
        clearSubCategoryModal();
      }
    } catch (error) {
      console.error('Erro ao atualizar subcategoria:', error);
    }
  }

  async function handleDeleteSubCategory() {
    try {
      if (selectedSubCategory) {
        await deleteSubCategory(selectedSubCategory.id);
        fetchCategoriesAndSubCategories(currentPage, pageSize);
        clearSubCategoryModal();
      }
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
    }
  }

  const isFormValid = newCategoryName.trim() !== '';
  const isSubCategoryFormValid =
    newSubCategoryName.trim() !== '' && newSubCategoryCategoryId.trim() !== '';

  return (
    <div className={styles['category-page']}>
      <Head>
        <title>Gerenciar Categorias</title>
        <meta name="description" content="Gerenciamento de categorias na Nilrow." />
      </Head>

      <div className={styles['category-container']}>
        <div className={styles['category-search-container']}>
          <HeaderButton onClick={() => router.back()} icon={closeIcon} />
          <input
            type="text"
            placeholder="Pesquisar por nome de categoria"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles['category-search-input']}
          />
          <button onClick={openCreateModal} className={styles['add-category-btn']}>
            + Adicionar categoria
          </button>
          <button onClick={openSubCategoryModal} className={styles['add-category-btn']}>
            + Adicionar subcategoria
          </button>
        </div>

        <div className={styles['category-section']}>
          <div className={styles['category-list']}>
            <div className={styles['category-header']}>
              <div className={styles['category-columnindex']}>#</div>
              <div className={styles['category-columnimage']}>Imagem</div>
              <div className={styles['category-columnname']}>Nome</div>
              <div className={styles['category-columnsubcategories']}>Subcategorias</div>
            </div>

            {categories.map((category, index) => {
              const isSelected = selectedCategory?.id === category.id;
              const backgroundColor = isSelected
                ? '#414141'
                : index % 2 === 0
                ? '#0B0B0B'
                : 'black';

              return (
                <div
                  key={category.id}
                  className={`${styles['category-row']} ${isSelected ? styles['selected'] : ''}`}
                  onClick={() => handleCategoryClick(category)}
                  style={{ backgroundColor, height: '57px', cursor: 'pointer' }}
                >
                  <div className={styles['category-columnindex']}>
                    {index + 1 + currentPage * pageSize}
                  </div>

                  <div className={styles['category-columnimage']}>
                    <div className={styles['category-image-wrapper']}>
                      <div className={styles['category-image-circle']}>
                        {category.imageUrl && (
                          <Image
                            src={`${apiUrl}${category.imageUrl}`}
                            alt={category.name}
                            width={40}
                            height={40}
                            className={styles['category-image']}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles['category-columnname']}>
                    {category.name}
                  </div>

                  <div className={styles['category-columnsubcategories']}>
                    {subCategoriesByCategory[category.id]?.length > 0 ? (
                      <>
                        {subCategoriesByCategory[category.id]
                          .slice(0, 3)
                          .map((sub, idx) => (
                            <span
                              key={sub.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubCategoryClick(sub);
                              }}
                              className={styles['subcategory-link']}
                            >
                              {sub.name}
                              {idx < Math.min(2, subCategoriesByCategory[category.id].length - 1) && (
                                <span>,&nbsp;</span>
                              )}
                            </span>
                          ))}
                        {subCategoriesByCategory[category.id].length > 3 && (
                          <span className={styles['more-subcategories']}>
                            + {subCategoriesByCategory[category.id].length - 3} mais
                          </span>
                        )}
                      </>
                    ) : (
                      'Nenhuma subcategoria'
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles['pagination-controls']}>
            <button onClick={handlePreviousPage} disabled={currentPage === 0}>
              Anterior
            </button>
            <span>
              Página {currentPage + 1} de {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage >= totalPages - 1}>
              Próxima
            </button>
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={clearModal}>
          <div className={styles['category-form']}>
            <h3 className={styles['category-title-form']}>
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>

            <CustomInput
              title="Nome da Categoria"
              type="text"
              name="name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
            />

            <div className={styles['add-channel-image-upload']}>
              <div className={styles['category-image-circle']}>
                {imagePreview ? (
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={21}
                    height={21}
                    className={styles['category-image-preview']}
                  />
                ) : (
                  <Image
                    src={defaultImage}
                    alt="Default"
                    width={21}
                    height={21}
                    className={styles['category-image-preview']}
                  />
                )}
              </div>

              <label htmlFor="category-image" className={styles['add-channel-upload-button']}>
                Escolher arquivo
              </label>
              <input
                type="file"
                id="category-image"
                name="image"
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>

            <div className="modal-buttons">
              {selectedCategory ? (
                <>
                  <StageButton
                    text="Atualizar"
                    backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                    onClick={handleUpdateCategory}
                    disabled={!isFormValid}
                  />
                  <StageButton
                    text="Excluir"
                    backgroundColor="#DF1414"
                    onClick={handleDeleteCategory}
                  />
                </>
              ) : (
                <StageButton
                  text="Criar"
                  backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                  onClick={handleCreateCategory}
                  disabled={!isFormValid}
                />
              )}
            </div>

            <h4>Subcategorias</h4>
            {selectedCategory && (
              <div className={styles['subcategory-list']}>
                {subCategoriesByCategory[selectedCategory.id]?.length > 0 ? (
                  subCategoriesByCategory[selectedCategory.id].map((sub) => (
                    <div
                      key={sub.id}
                      className={styles['subcategory-item']}
                      onClick={() => handleSubCategoryClick(sub)}
                    >
                      {sub.name}
                    </div>
                  ))
                ) : (
                  'Nenhuma subcategoria'
                )}
              </div>
            )}
          </div>
        </Modal>

        {/* MODAL DE SUBCATEGORIAS */}
        <Modal isOpen={isSubCategoryModalOpen} onClose={clearSubCategoryModal}>
          <div className={styles['subcategory-form']}>
            <h3 className={styles['subcategory-title-form']}>
              {selectedSubCategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}
            </h3>

            <CustomInput
              title="Nome da Subcategoria"
              type="text"
              name="subCategoryName"
              value={newSubCategoryName}
              onChange={(e) => setNewSubCategoryName(e.target.value)}
            />

            <ExternalSelect
              title="Selecionar Categoria"
              placeholder="Escolha uma categoria"
              options={categories.map((cat) => ({
                value: cat.id,
                label: cat.name
              }))}
              onChange={(e) => setNewSubCategoryCategoryId(e.target.value)}
              value={newSubCategoryCategoryId}
              isValid={newSubCategoryCategoryId.trim() !== ''}
            />

            <div className="modal-buttons">
              {selectedSubCategory ? (
                <>
                  <StageButton
                    text="Atualizar Subcategoria"
                    backgroundColor={isSubCategoryFormValid ? '#7B33E5' : '#212121'}
                    onClick={handleUpdateSubCategory}
                    disabled={!isSubCategoryFormValid}
                  />
                  <StageButton
                    text="Excluir Subcategoria"
                    backgroundColor="#DF1414"
                    onClick={handleDeleteSubCategory}
                  />
                </>
              ) : (
                <StageButton
                  text="Criar Subcategoria"
                  backgroundColor={isSubCategoryFormValid ? '#7B33E5' : '#212121'}
                  onClick={handleCreateSubCategory}
                  disabled={!isSubCategoryFormValid}
                />
              )}
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default memo(CategoryPage);
