import React, { useState, useEffect, memo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, createCategory, updateCategory, deleteCategory, getSubCategoriesByCategory, createSubCategory, updateSubCategory, deleteSubCategory } from '../../../services/adminCategoryApi';
import './Category.css';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import Modal from '../../../components/UI/Modal/Modal'; 
import getConfig from '../../../config';
import CustomInput from '../../../components/UI/CustomInput/CustomInput'; 
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import ExternalSelect from '../../../components/UI/ExternalSelect/ExternalSelect'; 
import defaultImage from '../../../assets/user.png';

const { apiUrl } = getConfig();

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [subCategoriesByCategory, setSubCategoriesByCategory] = useState({}); // Subcategorias associadas às categorias
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState(null);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newSubCategoryName, setNewSubCategoryName] = useState('');
    const [newSubCategoryCategoryId, setNewSubCategoryCategoryId] = useState(''); // Estado para a categoria selecionada na subcategoria
    const [newCategoryImage, setNewCategoryImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategoriesAndSubCategories();
    }, []);

    // Carregar categorias e subcategorias associadas
    const fetchCategoriesAndSubCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);

            // Carrega as subcategorias para cada categoria
            const subCategoriesMap = {};
            for (const category of data) {
                const subData = await getSubCategoriesByCategory(category.id);
                subCategoriesMap[category.id] = subData; // Associa as subcategorias à categoria pelo ID
            }
            setSubCategoriesByCategory(subCategoriesMap);
        } catch (error) {
            console.error('Erro ao buscar categorias e subcategorias:', error);
        }
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setNewCategoryName(category.name);
        setImagePreview(`${apiUrl}${category.imageUrl}`);
        setIsModalOpen(true);
    };

    const handleCreateCategory = async () => {
        try {
            await createCategory(newCategoryName, newCategoryImage);
            fetchCategoriesAndSubCategories();
            clearModal();
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
        }
    };

    const handleUpdateCategory = async () => {
        try {
            if (selectedCategory) {
                await updateCategory(selectedCategory.id, newCategoryName, newCategoryImage);
                fetchCategoriesAndSubCategories();
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
                fetchCategoriesAndSubCategories();
                clearModal();
            }
        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
        }
    };

    const handleCreateSubCategory = async () => {
        try {
            await createSubCategory({ name: newSubCategoryName, categoryId: newSubCategoryCategoryId });
            fetchCategoriesAndSubCategories();
            clearSubCategoryModal();
        } catch (error) {
            console.error('Erro ao criar subcategoria:', error);
        }
    };

    const handleUpdateSubCategory = async () => {
        try {
            if (selectedSubCategory) {
                await updateSubCategory(selectedSubCategory.id, { name: newSubCategoryName, categoryId: newSubCategoryCategoryId });
                fetchCategoriesAndSubCategories();
                clearSubCategoryModal();
            }
        } catch (error) {
            console.error('Erro ao atualizar subcategoria:', error);
        }
    };

    const handleDeleteSubCategory = async () => {
        try {
            if (selectedSubCategory) {
                await deleteSubCategory(selectedSubCategory.id);
                fetchCategoriesAndSubCategories();
                clearSubCategoryModal();
            }
        } catch (error) {
            console.error('Erro ao excluir subcategoria:', error);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setNewCategoryImage(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            alert('Por favor, selecione um arquivo de imagem válido.');
        }
    };

    const openCreateModal = () => {
        setSelectedCategory(null);
        setNewCategoryName('');
        setNewCategoryImage(null);
        setImagePreview(null);
        setIsModalOpen(true);
    };

    const openSubCategoryModal = () => {
        setSelectedSubCategory(null);
        setNewSubCategoryName('');
        setNewSubCategoryCategoryId(''); 
        setIsSubCategoryModalOpen(true);
    };

    const clearModal = () => {
        setSelectedCategory(null);
        setNewCategoryName('');
        setNewCategoryImage(null);
        setImagePreview(null);
        setIsModalOpen(false);
    };

    const clearSubCategoryModal = () => {
        setSelectedSubCategory(null);
        setNewSubCategoryName('');
        setNewSubCategoryCategoryId(''); 
        setIsSubCategoryModalOpen(false);
    };

    const isFormValid = newCategoryName.trim() !== '';
    const isSubCategoryFormValid = newSubCategoryName.trim() !== '' && newSubCategoryCategoryId.trim() !== ''; 

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
                    <button onClick={openCreateModal} className="add-category-btn">
                        + Adicionar categoria
                    </button>
                    <button onClick={openSubCategoryModal} className="add-category-btn">
                        + Adicionar subcategoria
                    </button>
                </div>
                <div className="category-section">
                    <div className="category-list">
                        <div className="category-header">
                            <div className="category-columnindex">#</div>
                            <div className="category-columnimage">Imagem</div>
                            <div className="category-columnname">Nome</div>
                            <div className="category-columnsubcategories">Subcategorias</div>
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

                                    <div className="category-columnsubcategories">
                                        {subCategoriesByCategory[category.id]?.map((sub, idx) => (
                                            <span key={sub.id}>
                                                {sub.name}{idx < subCategoriesByCategory[category.id].length - 1 && <span>,&nbsp;</span>}
                                            </span>
                                        )) || 'Nenhuma subcategoria'}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <Modal isOpen={isModalOpen} onClose={clearModal}>
                    <div className="category-form">
                        <h3 className="category-title-form">{selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}</h3>

                        <CustomInput
                            title="Nome da Categoria"
                            type="text"
                            name="name"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />

                        <div className="add-channel-image-upload">
                            <div className="category-image-circle">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="category-image-preview" />
                                ) : (
                                    <img src={defaultImage} alt="Default" className="category-image-preview" />
                                )}
                            </div>

                            <label htmlFor="category-image" className="add-channel-upload-button">
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

                <Modal isOpen={isSubCategoryModalOpen} onClose={clearSubCategoryModal}>
                    <div className="subcategory-form">
                        <h3 className="subcategory-title-form">{selectedSubCategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}</h3>

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
                            options={categories.map(cat => ({ value: cat.id, label: cat.name }))}
                            onChange={(e) => setNewSubCategoryCategoryId(e.target.value)}
                            value={newSubCategoryCategoryId}
                            isValid={newSubCategoryCategoryId.trim() !== ''}
                        />

                        <div className="modal-buttons">
                            {selectedSubCategory ? (
                                <>
                                    <StageButton
                                        text="Atualizar Subcategoria"
                                        backgroundColor={isSubCategoryFormValid ? "#7B33E5" : "#212121"}
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
                                    backgroundColor={isSubCategoryFormValid ? "#7B33E5" : "#212121"}
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
};

export default memo(Category);
