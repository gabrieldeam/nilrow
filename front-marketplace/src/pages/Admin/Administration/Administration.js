import React, { useState, memo } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom'; // Importa useNavigate
import { Helmet } from 'react-helmet-async';
import './Administration.css';
import Users from '../Users/Users';
import Category from '../Category/Category';
import LoadingSpinner from '../../../components/UI/LoadingSpinner/LoadingSpinner';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import iconStep1 from '../../../assets/contato.svg';
import iconStep2 from '../../../assets/user.svg';

const Administration = () => {
    const [loading] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="administration-page">
            <Helmet>
                <title>Administration</title>
                <meta name="description" content="Faça login na Nilrow usando seu email ou nome de usuário." />
            </Helmet>
            {loading && <LoadingSpinner />}
            <div className="administration-container">
                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <>                                
                                <div className="administration-list">
                                    <StepButton
                                        icon={iconStep1}
                                        title="Usuários"
                                        paragraph="Lista de usuários cadastrados"
                                        onClick={() => navigate('/admin/users')} // Corrige navegação
                                    />
                                    <StepButton
                                        icon={iconStep2}
                                        title="Categorias"
                                        paragraph="Crie e veja as categorias e subcategorias"
                                        onClick={() => navigate('/admin/category')} // Corrige navegação
                                    /> 
                                </div>
                            </>
                        } 
                    />
                    <Route path="users" element={<Users />} />                
                    <Route path="category" element={<Category />} />
                </Routes>
            </div>
        </div>
    );
};

export default memo(Administration);
