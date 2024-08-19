import React, { memo, useCallback, useEffect, useState, useContext } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import './MyCatalog.css';
import StepButton from '../../../components/UI/Buttons/StepButton/StepButton';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import promoterIcon from '../../../assets/promoter.svg';
import addressProfileIcon from '../../../assets/addressProfile.svg';
import dataeditIcon from '../../../assets/dataedit.svg';
import infoIcon from '../../../assets/info.svg';
import previewIcon from '../../../assets/preview.svg';
import productsIcon from '../../../assets/products.svg';
import ordersCatalogIcon from '../../../assets/ordersCatalog.svg';
import invoiceIcon from '../../../assets/invoice.svg';
import eventsIcon from '../../../assets/events.svg';
import { isCatalogReleased, isCatalogVisible, updateCatalogVisibility } from '../../../services/catalogApi';
import { NotificationContext } from '../../../context/NotificationContext';

const MyCatalog = () => {
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [catalogId, setCatalogId] = useState(null);
    const [badgeText, setBadgeText] = useState('Em analise');
    const [badgeBackgroundColor, setBadgeBackgroundColor] = useState('#DF1414');
    const [isVisible, setIsVisible] = useState(false);
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate('/catalog');
    }, [navigate]);

    const handleOrders = useCallback(() => {
        navigate('/catalog');
    }, [navigate]);

    useEffect(() => {
        const id = location.state?.catalogId || localStorage.getItem('selectedCatalogId');
        if (id) {
            setCatalogId(id);
        } else {
            navigate('/catalog');
        }
    }, [location.state, navigate]);

    useEffect(() => {
        if (catalogId) {
            isCatalogReleased(catalogId)
                .then((released) => {
                    if (released) {
                        setBadgeText('Liberado');
                        setBadgeBackgroundColor('#4FBF0A');
                    } else {
                        setBadgeText('Em analise');
                        setBadgeBackgroundColor('#DF1414');
                    }
                })
                .catch((error) => {
                    console.error('Erro ao verificar liberação do catálogo:', error);
                });

            isCatalogVisible(catalogId)
                .then((visible) => {
                    setIsVisible(visible);
                })
                .catch((error) => {
                    console.error('Erro ao verificar visibilidade do catálogo:', error);
                });
        }
    }, [catalogId]);

    const handleToggleVisibility = useCallback(() => {
        if (catalogId) {
            updateCatalogVisibility(catalogId, !isVisible)
                .then(() => {
                    setIsVisible(!isVisible);
                    setMessage('Visibilidade do catálogo atualizada com sucesso!', 'success');
                })
                .catch((error) => {
                    const errorMessage = error.response?.data?.message || 'Erro ao atualizar a visibilidade do catálogo.';
                    setMessage(errorMessage, 'error');
                    console.error('Erro ao atualizar a visibilidade do catálogo:', error);
                });
        }
    }, [catalogId, isVisible, setMessage]);

    const handleEditCatalog = useCallback(() => {
        if (catalogId) {
            navigate(`/edit-catalog/${catalogId}`);
        }
    }, [catalogId, navigate]);

    return (
        <div className="my-catalog-page">
            <Helmet>
                <title>Meu Catálogo</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Catálogo" buttons={{ close: true, orders: true }} handleBack={handleBack} />
            )}
            <div className="my-catalog-container">
                <div className="my-catalog-header">
                    <SubHeader title="Catálogo" handleBack={handleBack} showOrdersButton={true} handleOrders={handleOrders} />
                </div>
                <div className="my-catalog-additional-steps">
                    <StepButton
                        icon={dataeditIcon}
                        title="Dados da empresa"
                        paragraph="Informações da sua empresa e informações sobre funcionamento."
                        onClick={handleEditCatalog}
                    />
                    <StepButton
                        icon={previewIcon}
                        title="Visualização"
                        paragraph="Escolha onde seus produtos poderão ser vistos e vendidos"
                        onClick={() => navigate('/depois-colocar')}
                    />
                    <StepButton
                        icon={productsIcon}
                        title="Produtos"
                        paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
                        onClick={() => navigate('/catalog')}
                    />
                    <StepButton
                        icon={ordersCatalogIcon}
                        title="Pedidos"
                        paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
                        onClick={() => navigate('/depois-colocar')}
                    />
                    <div className="my-catalog-additional">
                        <StepButton
                            icon={addressProfileIcon}
                            title="Entrega"
                            paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
                            onClick={() => navigate('/depois-colocar')}
                        />                    
                        <StepButton
                            icon={promoterIcon}
                            title="Pagamento"
                            paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
                            onClick={() => navigate('/catalog')}
                        />
                        <StepButton
                            icon={invoiceIcon}
                            title="Notal fiscal"
                            paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
                            onClick={() => navigate('/depois-colocar')}
                        />
                        <StepButton
                            icon={eventsIcon}
                            title="Eventos"
                            paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
                            onClick={() => navigate('/depois-colocar')}
                        />
                    </div>
                    <Card title="Status">
                        <div className="see-data-wrapper">
                            <div className="my-catalog-element-info">
                                <img src={infoIcon} alt="info" className="my-catalog-info-icon" />
                                <div className="my-catalog-element-info-text">
                                    <p>Isso irá mostrar seus produtos na plataforma quanto ativo e liberado e irá retirar de tudo se não tiver ativo.</p>
                                    <a href="/" className="my-catalog-learn-more-link">Saiba mais sobre</a>
                                </div>
                            </div>
                            <SeeData
                                title="Mostrar no canal"
                                content="Mostrar o catálogo e todos os produtos associados a ele no seu canal."
                                stackContent={true}
                                showToggleButton={true}
                                onToggle={handleToggleVisibility}
                                toggled={isVisible}
                            />
                            <SeeData
                                title="Liberação da nilrow"
                                content="Liberação da comercialização pela nilrow."
                                stackContent={true}
                                badgeText={badgeText}
                                badgeBackgroundColor={badgeBackgroundColor}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default memo(MyCatalog);
