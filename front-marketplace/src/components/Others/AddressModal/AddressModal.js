import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import './AddressModal.css';
import { LocationContext } from '../../../context/LocationContext';

const AddressModal = ({ isOpen, onClose }) => {
    const [zip, setZip] = useState('');
    const { setLocation } = useContext(LocationContext);

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

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button className="close-button" onClick={onClose}>X</button>
                <form onSubmit={handleSubmit}>
                    <label>
                        CEP:
                        <input type="text" value={zip} onChange={handleChange} />
                    </label>
                    <button type="submit">Salvar</button>
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
