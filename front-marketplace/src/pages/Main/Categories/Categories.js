import React, { memo, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import CategoryList from '../../../components/UI/CategoryList/CategoryList';
import { getAllCategories, getSubCategoriesByCategory, getAllUserCategoryOrders, upsertUserCategoryOrder } from '../../../services/categoryApi'; // Adicionando o upsert
import getConfig from '../../../config';
import './Categories.css';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const { apiUrl } = getConfig();

const Categories = ({ onClose }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategoriesMap, setSubCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  const handleBack = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  }, [navigate, onClose]);

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        // Busca as categorias
        let allCategories = [];
        let page = 0;
        let size = 10;
        let hasMore = true;

        while (hasMore) {
          const response = await getAllCategories(page, size);
          if (response && response.content && response.content.length > 0) {
            allCategories = [...allCategories, ...response.content];
            page++;
          } else {
            hasMore = false;
          }
        }

        // Busca a ordem das categorias
        try {
          const userCategoryOrders = await getAllUserCategoryOrders();
          if (userCategoryOrders && Array.isArray(userCategoryOrders)) {
            // Reordenando as categorias com base no displayOrder
            allCategories.sort((a, b) => {
              const orderA = userCategoryOrders.find(order => order.categoryId === a.id)?.displayOrder || 0;
              const orderB = userCategoryOrders.find(order => order.categoryId === b.id)?.displayOrder || 0;
              return orderA - orderB;
            });
          }
        } catch (error) {
          // Se der erro, exibe na ordem que veio do getAllCategories
          console.error('Erro ao buscar ordem das categorias, usando ordem padrão:', error);
        }

        setCategories(allCategories);

        const subCategoriesData = {};

        // Busca as subcategorias
        for (const category of allCategories) {
          const subResponse = await getSubCategoriesByCategory(category.id);
          if (subResponse && subResponse.content && subResponse.content.length > 0) {
            subCategoriesData[category.id] = subResponse.content;
          } else if (Array.isArray(subResponse) && subResponse.length > 0) {
            subCategoriesData[category.id] = subResponse;
          } else {
            subCategoriesData[category.id] = [];
          }
        }

        setSubCategoriesMap(subCategoriesData);
        setLoading(false);

      } catch (error) {
        console.error('Erro ao buscar categorias e subcategorias:', error);
        setLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, []);

  // Função chamada quando a ordem é alterada pelo usuário
  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const reorderedCategories = Array.from(categories);
    const [movedCategory] = reorderedCategories.splice(result.source.index, 1);
    reorderedCategories.splice(result.destination.index, 0, movedCategory);

    setCategories(reorderedCategories);

    // Criando o array de ordens para enviar ao backend
    const updatedOrder = reorderedCategories.map((category, index) => ({
      id: category.id, // Esse ID pode ser o mesmo ou um valor gerado internamente
      categoryId: category.id,
      displayOrder: index // O novo displayOrder com base na nova posição
    }));

    try {
      // Enviando a nova ordem ao backend
      await upsertUserCategoryOrder(updatedOrder);
      console.log('Ordem de exibição atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar a ordem de exibição:', error);
    }
  };

  return (
    <div className="categories-container">
      <Helmet>
        <title>Categorias</title>
        <meta name="description" content="Veja seus pedidos na Nilrow." />
      </Helmet>
      <MobileHeader
        title="Categorias"
        buttons={{ close: true }}
        handleBack={handleBack}
      />
      {loading ? (
        <div>Carregando...</div>
      ) : (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId="categories">
            {(provided) => (
              <div
                className="categories-list"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {categories.map((category, index) => (
                  <Draggable key={category.id} draggableId={category.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`draggable-item ${snapshot.isDragging ? 'dragging' : ''}`}
                      >
                        <CategoryList
                          title={category.name}
                          paragraph={
                            subCategoriesMap[category.id] && subCategoriesMap[category.id].length > 0
                              ? subCategoriesMap[category.id].map(sub => sub.name).join(', ')
                              : 'Sem subcategorias'
                          }
                          icon={`${apiUrl}${category.imageUrl}`}
                          onClick={() => {
                            navigate(`/category/${category.name}/tudo`);
                          }}
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
