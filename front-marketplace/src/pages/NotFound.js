import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css'; // Arquivo de estilo para personalizar a página de erro

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/'); // Redireciona para a página inicial
    };

    return (
        <div className="not-found-container">
            <h1 className="not-found-title">404</h1>
            <p className="not-found-message">Oops! A página que você está procurando não foi encontrada.</p>
            <button className="not-found-button" onClick={handleGoHome}>
                Voltar para a Home
            </button>
        </div>
    );
};

export default NotFound;
