'use client';

import React, { useState, useEffect, memo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';

import {
  getAllBrands,
  createBrand,
  updateBrand,
  deleteBrand
} from '@/services/product/brandService';

import HeaderButton from '../../../components/UI/HeaderButton/HeaderButton';
import Modal from '../../../components/Modals/Modal/Modal';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import StageButton from '../../../components/UI/StageButton/StageButton';

import closeIcon from '../../../../public/assets/close.svg';

import styles from './brand.module.css';

interface Brand {
  id: string;
  name: string;
}

interface BrandsResponse {
  content: Brand[];
  totalPages: number;
}

function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [newBrandName, setNewBrandName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchBrands(currentPage, pageSize);
  }, [currentPage]);

  async function fetchBrands(page: number, size: number) {
    try {
      const data: BrandsResponse = await getAllBrands(page, size);
      setBrands(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching brands:', error);
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

  function handleBrandClick(brand: Brand) {
    setSelectedBrand(brand);
    setNewBrandName(brand.name);
    setIsModalOpen(true);
  }

  function openCreateModal() {
    setSelectedBrand(null);
    setNewBrandName('');
    setIsModalOpen(true);
  }

  function clearModal() {
    setSelectedBrand(null);
    setNewBrandName('');
    setIsModalOpen(false);
  }

  async function handleCreateBrand() {
    try {
      await createBrand({ name: newBrandName });
      fetchBrands(currentPage, pageSize);
      clearModal();
    } catch (error) {
      console.error('Error creating brand:', error);
    }
  }

  async function handleUpdateBrand() {
    try {
      if (selectedBrand) {
        await updateBrand(selectedBrand.id, {
          ...selectedBrand,
          name: newBrandName
        });
        fetchBrands(currentPage, pageSize);
        clearModal();
      }
    } catch (error) {
      console.error('Error updating brand:', error);
    }
  }

  async function handleDeleteBrand() {
    try {
      if (selectedBrand) {
        await deleteBrand(selectedBrand.id);
        fetchBrands(currentPage, pageSize);
        clearModal();
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  }

  const isFormValid = newBrandName.trim() !== '';

  return (
    <div className={styles['category-page']}>
      <Head>
        <title>Manage Brands</title>
        <meta name="description" content="Brands Management" />
      </Head>

      <div className={styles['category-container']}>
        <div className={styles['category-search-container']}>
          <HeaderButton onClick={() => router.back()} icon={closeIcon} />
          <button onClick={openCreateModal} className={styles['add-category-btn']}>
            + Add Brand
          </button>
        </div>

        <div className={styles['category-section']}>
          <div className={styles['category-list']}>
            <div className={styles['category-header']}>
              <div className={styles['category-columnindex']}>#</div>
              <div className={styles['category-columnname']}>Name</div>
            </div>

            {brands.map((brand, index) => {
              const isSelected = selectedBrand?.id === brand.id;
              const backgroundColor = isSelected
                ? '#414141'
                : index % 2 === 0
                ? '#0B0B0B'
                : 'black';

              return (
                <div
                  key={brand.id}
                  className={`${styles['category-row']} ${isSelected ? styles['selected'] : ''}`}
                  onClick={() => handleBrandClick(brand)}
                  style={{ backgroundColor, height: '57px', cursor: 'pointer' }}
                >
                  <div className={styles['category-columnindex']}>
                    {index + 1 + currentPage * pageSize}
                  </div>
                  <div className={styles['category-columnname']}>{brand.name}</div>
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

        <Modal isOpen={isModalOpen} onClose={clearModal}>
          <div className={styles['category-form']}>
            <h3 className={styles['category-title-form']}>
              {selectedBrand ? 'Edit Brand' : 'New Brand'}
            </h3>

            <CustomInput
              title="Brand Name"
              type="text"
              name="name"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />

            <div className="modal-buttons">
              {selectedBrand ? (
                <>
                  <StageButton
                    text="Update"
                    backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                    onClick={handleUpdateBrand}
                    disabled={!isFormValid}
                  />
                  <StageButton
                    text="Delete"
                    backgroundColor="#DF1414"
                    onClick={handleDeleteBrand}
                  />
                </>
              ) : (
                <StageButton
                  text="Create"
                  backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
                  onClick={handleCreateBrand}
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

export default memo(BrandPage);
