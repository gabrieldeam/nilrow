import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import './AddressModal.css';
import { LocationContext } from '../../../context/LocationContext';
import CustomInput from '../../UI/CustomInput/CustomInput';
import Card from '../../UI/Card/Card';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';

const AddressModal = ({ isOpen, onClose }) => {
    const { location, setLocation } = useContext(LocationContext);
    const [zip, setZip] = useState(location.zip || '');
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

    if (!isOpen) return null;

    return (
        <div className="address-modal-overlay">
            <div className="address-modal-container">
                <div className="address-modal-close-button">
                    <HeaderButton icon={closeIcon} onClick={onClose} />
                </div>
                <h2 className="address-modal-title roboto-medium">Selecione onde quer receber suas compras</h2>
                <p className="address-modal-description roboto-regular">
                    Você poderá ver custos e prazos de entrega precisos em tudo que procurar.
                </p>
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
