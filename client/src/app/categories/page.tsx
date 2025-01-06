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

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

const Categories: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState<{ [key: string]: SubCategoryData[] }>({});
  const [loading, setLoading] = useState(true);

  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  }, [router, onClose]);

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        // 1) Buscar categorias em várias páginas, se necessário
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

        // 2) Tentar buscar a ordem do usuário
        let userCategoryOrders: UserCategoryOrderDTO[] = [];
        try {
          userCategoryOrders = await getAllUserCategoryOrders();
        } catch (error: any) {
          // Se der 401 ou 403, significa que o usuário não está logado ou não tem permissão
          if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn('Usuário não autenticado ou sem permissão. Exibindo categorias na ordem padrão.');
          } else {
            console.error('Erro ao buscar ordens de categorias do usuário:', error);
          }
        }

        // 3) Se conseguimos pegar userCategoryOrders, reordenamos
        if (Array.isArray(userCategoryOrders) && userCategoryOrders.length > 0) {
          allCategories.sort((a, b) => {
            const orderA = userCategoryOrders.find(o => o.categoryId === a.id)?.order || 0;
            const orderB = userCategoryOrders.find(o => o.categoryId === b.id)?.order || 0;
            return orderA - orderB;
          });
        }

        // 4) Setar as categorias no state
        setCategories(allCategories);

        // 5) Buscar subcategorias de cada categoria
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
  }, []);

  // Drag-and-drop para reordenar na tela
  const handleOnDragEnd = async (result: any) => {
    if (!result.destination) return;

    const reorderedCategories = Array.from(categories);
    const [movedCategory] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, movedCategory);

    setCategories(reorderedCategories);

    const updatedOrder: UserCategoryOrderDTO[] = reorderedCategories.map((category, index) => ({
      categoryId: category.id,
      order: index,
    }));

    // Aqui também, se não tiver permissão, retornará 401/403
    try {
      await upsertUserCategoryOrder(updatedOrder);
      console.log('Ordem de exibição atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar a ordem de exibição (usuário não autenticado ou sem permissão):', error);
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
                  <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
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
