import React, { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../../services/adminCategoryApi';
import './Category.css';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import Modal from '../../../components/UI/Modal/Modal'; 
import getConfig from '../../../config';
import CustomInput from '../../../components/UI/CustomInput/CustomInput'; // Custom Input
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton'; // Stage Button

const { apiUrl } = getConfig();

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null); // Para pré-visualização da imagem
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
        setImagePreview(`${apiUrl}${category.imageUrl}`); // Pré-visualizar imagem da categoria
        setIsModalOpen(true); // Abre o modal para edição
    };

    const handleCreateCategory = async () => {
        try {
            await createCategory(newCategoryName, newCategoryImage);
            fetchCategories();
            clearModal();
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
        }
    };

    const handleUpdateCategory = async () => {
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory.id, newCategoryName, newCategoryImage);
                fetchCategories();
                clearModal();
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
                clearModal();
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
            setImagePreview(URL.createObjectURL(file)); // Pré-visualizar imagem carregada
        } else {
            alert('Por favor, selecione um arquivo de imagem válido.');
        }
    };

    // Função para abrir a modal de criação
    const openCreateModal = () => {
        setSelectedCategory(null);
        setNewCategoryName(''); // Limpar o nome da categoria
        setNewCategoryImage(null); // Limpar a imagem
        setImagePreview(null); // Limpar a pré-visualização da imagem
        setIsModalOpen(true); // Abre a modal
    };

    const clearModal = () => {
        setSelectedCategory(null);
        setNewCategoryName('');
        setNewCategoryImage(null);
        setImagePreview(null);
        setIsModalOpen(false); // Certifique-se de que isso está fechando o modal corretamente
    };

    const isFormValid = newCategoryName.trim() !== ''; // Validação do formulário

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
                        onClick={openCreateModal} // Abre o modal para criação
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

                <Modal isOpen={isModalOpen} onClose={clearModal}>
                    <div className="category-form">
                        <h3>{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>

                        {/* Custom Input para nome da categoria */}
                        <CustomInput
                            title="Nome da Categoria"
                            type="text"
                            name="name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />

                        {/* Upload da imagem e pré-visualização */}
                        <div className="add-channel-image-upload">
                            <div className="category-image-circle">
                                {imagePreview && (
                                    <img src={imagePreview} alt="Preview" className="category-image" />
                                )}
                            </div>
                            <input
                                type="file"
                                id="category-image"
                                name="image"
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="category-image" className="add-channel-upload-button">
                                Escolher arquivo
                            </label>
                        </div>

                        {/* Botões StageButton */}
                        <div className="modal-buttons">
                            {selectedCategory ? (
                                <>
                                    <StageButton
                                        text="Atualizar"
                                        backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
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
                                    backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                                    onClick={handleCreateCategory}
                                    disabled={!isFormValid}
                                />
                            )}
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default memo(Category);
