import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import './AddressModal.css';
import { LocationContext } from '../../../context/LocationContext';
import { NotificationContext } from '../../../context/NotificationContext';
import CustomInput from '../../UI/CustomInput/CustomInput';
import Card from '../../UI/Card/Card';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import { getAddresses } from '../../../services/profileApi';
import SeeData from '../../UI/SeeData/SeeData';

const AddressModal = ({ isOpen, onClose }) => {
    const { location, setLocation } = useContext(LocationContext);
    const { setMessage } = useContext(NotificationContext);
    const [zip, setZip] = useState(location.zip || '');
    const [addresses, setAddresses] = useState([]);
    const [showAllAddresses, setShowAllAddresses] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setZip(location.zip || '');
    }, [location.zip]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }

        return () => {
            document.body.classList.remove('body-no-scroll');
        };
    }, [isOpen]);

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

    const handleChange = (e) => {
        setZip(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!zip) return;

        try {
            const response = await fetch(`https://viacep.com.br/ws/${zip}/json/`);
            const data = await response.json();
            if (data.erro) {
                alert('CEP inválido');
                return;
            }
            setLocation({
                city: data.localidade,
                state: data.uf,
                latitude: 0, // Substitua por dados reais se disponíveis
                longitude: 0, // Substitua por dados reais se disponíveis
                zip: data.cep
            });
            onClose();
        } catch (error) {
            console.error('Error fetching address:', error);
        }
    };

    const handleAddCompleteAddress = (e) => {
        e.preventDefault();
        onClose();
        navigate('/address');
    };

    const handleUseZip = (address) => {
        setLocation({
            city: address.city,
            state: address.state,
            latitude: 0,
            longitude: 0,
            zip: address.cep
        });
        onClose();
    };

    const toggleShowAllAddresses = () => {
        setShowAllAddresses(!showAllAddresses);
    };

    if (!isOpen) return null;

    const displayedAddresses = showAllAddresses ? addresses : addresses.slice(0, 4);

    return (
        <div className="address-modal-overlay">
            <div className="address-modal-close-button">
                <HeaderButton icon={closeIcon} onClick={onClose} />
            </div>
            <div className="address-modal-container">
                <h2 className="address-modal-title roboto-medium">Selecione onde quer receber suas compras</h2>
                <p className="address-modal-description roboto-regular">
                    Você poderá ver custos e prazos de entrega precisos em tudo que procurar.
                </p>
                <Card 
                    title="Endereços cadastrados"
                    rightLink={{ href: "/address", text: "Editar endereços" }}                
                >
                    <div className="address-modal-see-data-wrapper">
                        {displayedAddresses.map(address => (
                            <SeeData 
                                key={address.id}
                                title={address.street}
                                content={`${address.cep} - ${address.city}/${address.state}`}
                                stackContent={true}
                                linkText="Usar esse CEP"
                                link="#"
                                onClick={() => handleUseZip(address)}
                            />
                        ))}
                    </div>
                    {addresses.length > 4 && (
                        <button onClick={toggleShowAllAddresses} className="address-modal-toggle-button">
                            {showAllAddresses ? 'Ver menos' : 'Ver todos'}
                        </button>
                    )}
                </Card>
                <form className="address-modal-form" onSubmit={handleSubmit}>
                    <Card title="CEP">
                        <CustomInput 
                            title="Código de Endereço Postal"
                            type="text"
                            value={zip}
                            onChange={handleChange}
                            bottomLeftText="Informe um CEP"
                            bottomRightLink={{ href: "/zip-code-search", text: "Não sei o meu CEP" }}
                        />
                    </Card>
                    <a href="/address" className="address-modal-add-link" onClick={handleAddCompleteAddress}>
                        + Adicionar endereço completo
                    </a>
                    <button type="submit" className="address-modal-save-button">Salvar modificações</button>
                </form>
            </div>
        </div>
    );
};

AddressModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default AddressModal;
