import React, { memo, useCallback, useEffect, useState } from 'react';
import './Privacy.css';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import ConfirmationModal from '../../../components/UI/ConfirmationModal/ConfirmationModal'; // Importando o modal de confirmação
import { getAcceptsSms, updateAcceptsSms, deleteUser } from '../../../services/privacyApi';

const Privacy = () => {
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();
    const [acceptsSms, setAcceptsSms] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controle do modal de confirmação

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAcceptsSms();
                setAcceptsSms(data); // Data is a boolean
            } catch (error) {
                console.error('Error fetching acceptsSms:', error);
            }
        };
        fetchData();
    }, []);

    const handleToggle = async (newState) => {
        try {
            await updateAcceptsSms(newState); // Enviando o estado booleano diretamente
            setAcceptsSms(newState);
        } catch (error) {
            console.error('Error updating acceptsSms:', error);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await deleteUser();
            // Redirecionar ou realizar outras ações após deletar a conta
            navigate('/'); // Exemplo: Redirecionar para a página inicial
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className="privacy-page">
            <Helmet>
                <title>Privacidade</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Privacidade" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="privacy-container">
                <div className="privacy-header">
                    <SubHeader title="Privacidade" handleBack={handleBack} />
                    <div className="delete-link desktop-only">
                        <button className="delete-button" onClick={openModal}>Deletar conta</button>
                    </div>
                </div>
                <Card title="Gerenciar permissões de privacidade">
                    <div className="see-data-wrapper">
                        <SeeData 
                            title="Aceito que entrem em contato comigo via WhatsApp e/ou SMS neste número." 
                            content="Mantenha a permissão ativa para receber recomendações úteis sobre outros produtos ao usar sua conta." 
                            stackContent={true}
                            showToggleButton={true}
                            onToggle={handleToggle} 
                            toggled={acceptsSms}
                        />                    
                        {/* Outros componentes SeeData se necessário */}
                    </div>
                </Card>
                <div className="delete-link mobile-only">
                    <button className="delete-button" onClick={openModal}>Deletar conta</button>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isModalOpen}
                onConfirm={handleDeleteAccount}
                onCancel={closeModal}
                message="Você tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita."
            />
        </div>
    );
};

export default memo(Privacy);
