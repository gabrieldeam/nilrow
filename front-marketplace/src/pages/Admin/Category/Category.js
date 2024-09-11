import React, { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../services/adminCategoryApi';
import './Category.css';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import Modal from '../../../components/UI/Modal/Modal'; 
import getConfig from '../../../config';

const { apiUrl } = getConfig();

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setNewCategoryName(category.name);
        setIsModalOpen(true); // Abre o modal para edição
    };

    const handleCreateCategory = async () => {
        try {
            await createCategory(newCategoryName, newCategoryImage);
            fetchCategories();
            setNewCategoryName('');
            setNewCategoryImage(null);
            setIsModalOpen(false); // Fecha o modal após criar a categoria
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
        }
    };

    const handleUpdateCategory = async () => {
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory.id, newCategoryName, newCategoryImage);
                fetchCategories();
                setSelectedCategory(null);
                setNewCategoryName('');
                setNewCategoryImage(null);
                setIsModalOpen(false); // Fecha o modal após atualizar a categoria
            }
        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            if (selectedCategory) {
                await deleteCategory(selectedCategory.id);
                fetchCategories();
                setSelectedCategory(null);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
        }
    };

    // Função para validar o arquivo de imagem
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setNewCategoryImage(file);
        } else {
            alert('Por favor, selecione um arquivo de imagem válido.');
        }
    };

    const clearModal = () => {
        setSelectedCategory(null);
        setNewCategoryName('');
        setNewCategoryImage(null);
        setIsModalOpen(true);
    };

    return (
        <div className="category-page">
            <Helmet>
                <title>Gerenciar Categorias</title>
                <meta name="description" content="Gerenciamento de categorias na Nilrow." />
            </Helmet>
            <div className="category-container">
                <div className="category-search-container">
                    <HeaderButton
                        onClick={() => navigate(-1)}
                        icon={closeIcon}
                    />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome de categoria"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="category-search-input"
                    />
                    <button 
                        onClick={clearModal} // Abre o modal para criação
                        className="add-category-btn"
                    >
                        + Adicionar categoria
                    </button>
                </div>
                <div className="category-section">
                    <div className="category-list">
                        <div className="category-header">
                            <div className="category-columnindex">#</div>
                            <div className="category-columnimage">Imagem</div>
                            <div className="category-columnname">Nome</div>
                        </div>
                        {categories
                            .filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                            .map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`category-row ${selectedCategory?.id === category.id ? 'selected' : ''}`}
                                    onClick={() => handleCategoryClick(category)}
                                    style={{ 
                                        backgroundColor: selectedCategory?.id === category.id ? '#414141' : (index % 2 === 0 ? '#0B0B0B' : 'black'), 
                                        height: '57px' 
                                    }}
                                >
                                    <div className="category-columnindex">{index + 1}</div>

                                    <div className="category-columnimage">
                                        <div className="category-image-wrapper">
                                            <div className="category-image-circle">
                                                {category.imageUrl && (
                                                    <img
                                                        src={`${apiUrl}${category.imageUrl}`}
                                                        alt={category.name}
                                                        className="category-image"
                                                    />
                                                )}
                                            </div>
                                        </div>                                
                                    </div>

                                    <div className="category-columnname">{category.name}</div>
                                </div>
                            ))}
                    </div>
                </div>

                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <div className="category-form">
                        <h3>{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>
                        <input
                            type="text"
                            placeholder="Nome da Categoria"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <input
                            type="file"
                            onChange={handleFileChange} // Validação do arquivo de imagem
                        />
                        {selectedCategory ? (
                            <>
                                <button onClick={handleUpdateCategory}>Atualizar</button>
                                <button onClick={handleDeleteCategory} className="delete-btn">Excluir</button>
                            </>
                        ) : (
                            <button onClick={handleCreateCategory}>Criar</button>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default memo(Category);
