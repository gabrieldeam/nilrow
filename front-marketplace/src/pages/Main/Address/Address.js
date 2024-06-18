import React, { useCallback, useState, useEffect, useContext } from 'react';
import './Address.css';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import SeeData from '../../../components/UI/SeeData/SeeData';
import { getAddresses } from '../../../services/profileApi';
import { NotificationContext } from '../../../context/NotificationContext';

const Address = () => {
    const { setMessage } = useContext(NotificationContext);
    const [addresses, setAddresses] = useState([]);
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const data = await getAddresses();
                setAddresses(data);
            } catch (error) {
                console.error('Erro ao buscar endereços:', error);
                setMessage('Erro ao buscar endereços. Tente novamente.', 'error');
            }
        };

        fetchAddresses();
    }, [setMessage]);

    return (
        <div className="address-page">
            <Helmet>
                <title>Endereço</title>
                <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Endereço" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="address-container">
                <SubHeader title="Endereço" handleBack={handleBack} />
                <Card 
                    title="Cadastrados"
                    rightLink={{ href: "/add-address", text: "+ Adicionar endereço" }}
                >
                    <div className="address-see-data-wrapper">
                        {addresses.map(address => (
                            <SeeData 
                                key={address.id}
                                title={address.street}
                                content={`CEP: ${address.cep} - ${address.city}/${address.state}`}
                                stackContent={true}
                                subContent={`${address.recipientName} - ${address.recipientPhone}`}
                                linkText="Editar"
                                link={`/edit-address/${address.id}`} // Link para a página de edição de endereço
                            />
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Address;
