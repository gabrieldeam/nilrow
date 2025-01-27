'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileHeader from '../../components/Layout/MobileHeader/MobileHeader';
import CategoryList from '../../components/UI/CategoryList/CategoryList';
import {
  getAllCategories,
  getSubCategoriesByCategory,
  getAllUserCategoryOrders,
  upsertUserCategoryOrder,
} from '../../services/categoryService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { CategoryData, SubCategoryData, UserCategoryOrderDTO } from '../../types/services/category';
import styles from './Categories.module.css';
import { useAuth } from '../../hooks/useAuth';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

const Categories: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState<{ [key: string]: SubCategoryData[] }>({});
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  console.log('Categories.tsx -> isAuthenticated:', isAuthenticated);

  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [router, onClose]);

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      setLoading(true);

      try {
        let allCategories: CategoryData[] = [];
        let page = 0;
        const size = 10;
        let hasMore = true;

        while (hasMore) {
          const pageData = await getAllCategories(page, size);
          if (pageData.length > 0) {
            allCategories = [...allCategories, ...pageData];
            page++;
          } else {
            hasMore = false;
          }
        }

        if (isAuthenticated) {
          try {
            const userCategoryOrders: UserCategoryOrderDTO[] = await getAllUserCategoryOrders();
            console.log('Orders retornadas pela API:', userCategoryOrders);
            if (Array.isArray(userCategoryOrders) && userCategoryOrders.length > 0) {
              const normalizedOrders = userCategoryOrders.map((o) => ({
                ...o,
                categoryId: Number(o.categoryId),
              }));

              allCategories.sort((a, b) => {
                const orderA = userCategoryOrders.find(o => String(o.categoryId) === String(a.id))?.displayOrder ?? 0;
                const orderB = userCategoryOrders.find(o => String(o.categoryId) === String(b.id))?.displayOrder ?? 0;
                return orderA - orderB;
              });
            }
          } catch (error: any) {
            console.error('Erro ao buscar ordens de categorias do usuário:', error);
          }
        } else {
          console.log('Usuário não autenticado, usando ordem padrão das categorias.');
        }

        setCategories(allCategories);

        const subCategoriesData: { [key: string]: SubCategoryData[] } = {};
        for (const category of allCategories) {
          try {
            const subResponse = await getSubCategoriesByCategory(category.id);
            subCategoriesData[category.id] = subResponse;
          } catch (subError) {
            console.error(`Erro ao buscar subcategorias de ${category.id}:`, subError);
            subCategoriesData[category.id] = [];
          }
        }
        setSubCategoriesMap(subCategoriesData);
      } catch (error) {
        console.error('Erro ao buscar categorias e subcategorias:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, [isAuthenticated]);

  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reorderedCategories = Array.from(categories);
    const [movedCategory] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, movedCategory);

    setCategories(reorderedCategories);
    if (isAuthenticated) {
      try {
        const updatedOrder: UserCategoryOrderDTO[] = reorderedCategories.map((category, index) => ({
          categoryId: category.id,
          displayOrder: index,
        }));

        await upsertUserCategoryOrder(updatedOrder);
        console.log('Ordem de exibição atualizada com sucesso!', updatedOrder);
        const newOrders = await getAllUserCategoryOrders();
        console.log('Ordem retornada após upsertUserCategoryOrder:', newOrders);

      } catch (error) {
        console.error('Erro ao atualizar a ordem de exibição:', error);
      }
    } else {
      console.log('Usuário não autenticado, ordem não será salva no servidor.');
    }
  };
  return (
    <div className={styles.container}>
      <MobileHeader title="Categorias" buttons={{ close: true }} handleBack={handleBack} />

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div className={styles.list} {...provided.droppableProps} ref={provided.innerRef}>
                {categories.map((category, index) => (
                  <Draggable 
                  key={category.id} 
                  draggableId={String(category.id)} 
                  index={index}
                  isDragDisabled={!isAuthenticated}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`${styles.item} ${snapshot.isDragging ? styles.dragging : ''}`}
                      >
                        <CategoryList
                          title={category.name}
                          paragraph={
                            subCategoriesMap[category.id]?.length
                              ? subCategoriesMap[category.id].map(sub => sub.name).join(', ')
                              : 'Sem subcategorias'
                          }
                          icon={`${apiUrl}${category.imageUrl}`}
                          onClick={() => router.push(`/category/${category.name}/tudo`)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
};

export default memo(Categories);
