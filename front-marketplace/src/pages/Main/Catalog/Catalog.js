import React, { memo, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import { getVisibleCatalogs, getHiddenCatalogs } from '../../../services/catalogApi';
import { getAddressById } from '../../../services/profileApi'; // Importe o getAddressById
import './Catalog.css';

const Catalog = () => {
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();
    const [visibleCatalogs, setVisibleCatalogs] = useState([]);
    const [hiddenCatalogs, setHiddenCatalogs] = useState([]);

    const handleBack = useCallback(() => {
        navigate('/my-channel');
    }, [navigate]);

    useEffect(() => {
        const fetchCatalogs = async () => {
            try {
                const visible = await getVisibleCatalogs();
                const hidden = await getHiddenCatalogs();

                // Para cada catálogo, busque o endereço e adicione ao objeto
                const visibleWithAddresses = await Promise.all(visible.map(async catalog => {
                    const address = await getAddressById(catalog.addressId);
                    return { ...catalog, address };
                }));

                const hiddenWithAddresses = await Promise.all(hidden.map(async catalog => {
                    const address = await getAddressById(catalog.addressId);
                    return { ...catalog, address };
                }));

                setVisibleCatalogs(visibleWithAddresses);
                setHiddenCatalogs(hiddenWithAddresses);
            } catch (error) {
                console.error('Erro ao buscar catálogos:', error);
            }
        };

        fetchCatalogs();
    }, []);

    const renderCatalog = (catalog) => (
        <SeeData 
            key={catalog.id}
            title={catalog.name}
            content={catalog.address ? `CEP: ${catalog.address.cep} - ${catalog.address.city}, ${catalog.address.state}` : 'Endereço não disponível'}
            subContent={`CNPJ: ${catalog.cnpj}`} 
            stackContent={true}
            linkText="Gerenciar"                        
            link={`/my-catalog/${catalog.id}`}
        />
    );

    const renderEmptyMessage = (message) => (
        <div className="empty-catalog-message">
            {message}
        </div>
    );

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
                        {hiddenCatalogs.length > 0 
                            ? hiddenCatalogs.map(renderCatalog) 
                            : renderEmptyMessage("Nenhum catálogo cadastrado.")}
                    </div>
                </Card>
                <Card 
                    title="Visíveis no canal"                   
                >
                    <div className="catalog-see-data-wrapper">
                        {visibleCatalogs.length > 0 
                            ? visibleCatalogs.map(renderCatalog) 
                            : renderEmptyMessage("Nenhum catálogo visível no canal.")}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default memo(Catalog);
