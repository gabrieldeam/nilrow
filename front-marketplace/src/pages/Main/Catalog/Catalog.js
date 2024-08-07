import React, { memo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import './Catalog.css';

const Catalog = () => {
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return (
        <div className="catalog-page">
            <Helmet>
                <title>Catálogo</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Catálogo" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="catalog-container">
                <div className="catalog-header">
                    <SubHeader title="Catálogo" handleBack={handleBack} />
                </div>
                <Card 
                    title="Cadastrados"
                    rightLink={{ href: "/add-catalog", text: "+ Adicionar catálogo" }}
                >
                    <div className="catalog-see-data-wrapper">
                        <SeeData 
                            title="Nome do Catálago" 
                            content="CEP - Cidade, Estado" 
                            subContent="CNPJ" 
                            stackContent={true}
                            linkText="Gerenciar"                        
                            link={`/my-catalog/`}
                        />                        
                    </div>
                </Card>
                <Card 
                    title="Ativos no canal"                   
                >
                    <div className="catalog-see-data-wrapper">
                        <SeeData 
                            title="Nome do Catálago" 
                            content="CEP - Cidade, Estado" 
                            subContent="cnpj" 
                            stackContent={true}
                            linkText="Gerenciar"                        
                            link={`/my-catalog/`}
                        />                        
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default memo(Catalog);
