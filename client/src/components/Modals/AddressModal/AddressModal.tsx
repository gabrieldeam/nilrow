'use client';

import React, { useState, useContext, useEffect, useCallback } from 'react';
import styles from './AddressModal.module.css';
import { AddressModalProps, Address } from '../../../types/components/Modals/AddressModal';
import { LocationContext } from '../../../context/LocationContext';
import { useNotification } from '../../../hooks/useNotification';
import CustomInput from '../../UI/CustomInput/CustomInput';
import Card from '../../UI/Card/Card';
import HeaderButton from '../../UI/HeaderButton/HeaderButton';
import SeeData from '../../UI/SeeData/SeeData';
import closeIcon from '../../../../public/assets/close.svg';
import { getAddresses } from '../../../services/profileService';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../../hooks/useAuth';

const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { location, setLocation } = useContext(LocationContext)!;
  const { setMessage } = useNotification();
  const router = useRouter();
  
  const { isAuthenticated, loading } = useAuth();

  const [zip, setZip] = useState(location.zip || '');
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);

  useEffect(() => {
    setZip(location.zip || '');
  }, [location.zip]);

  useEffect(() => {
    document.body.classList.toggle(styles['body-no-scroll'], isOpen);
    return () => {
      document.body.classList.remove(styles['body-no-scroll']);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (!loading && isAuthenticated) {
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
    }
  }, [isOpen, isAuthenticated, loading, setMessage]);

  // Submete CEP manual
  const handleSubmit = async (e: React.FormEvent) => {
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
        latitude: 0,
        longitude: 0,
        zip: data.cep,
      });
      onClose();
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const toggleShowAllAddresses = useCallback(() => {
    setShowAllAddresses((prev) => !prev);
  }, []);

  const handleUseZip = (address: Address) => {
    setLocation({
      city: address.city,
      state: address.state,
      latitude: 0,
      longitude: 0,
      zip: address.cep,
    });
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLDivElement).classList.contains(styles['address-modal-overlay'])) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayedAddresses = showAllAddresses ? addresses : addresses.slice(0, 4);

  return (
    <div className={styles['address-modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['address-modal-container']}>
        <div className={styles['address-modal-close-button-wrapper']}>
          <HeaderButton icon={closeIcon} onClick={onClose} />
        </div>
        
        <h2 className={`${styles['address-modal-title']} roboto-medium`}>
          Selecione onde você está
        </h2>
        <p className={`${styles['address-modal-description']} roboto-regular`}>
          Você poderá ver custos e prazos de entrega precisos em tudo que procurar.
        </p>
        {isAuthenticated && (
          <Card
            title="Endereços cadastrados"
            rightLink={{ href: '/address', text: 'Editar endereços' }}
          >
            {addresses.length === 0 ? (
              <div className={styles['address-modal-no-results']}>
                <p>Nenhum endereço cadastrado.</p>
              </div>
            ) : (
              displayedAddresses.map((address) => (
                <SeeData
                  key={address.id}
                  title={address.street}
                  content={`${address.cep} - ${address.city}/${address.state}`}
                  linkText="Usar esse CEP"
                  onClick={() => handleUseZip(address)}
                  stackContent={true}
                />
              ))
            )}
            {addresses.length > 4 && (
              <button onClick={toggleShowAllAddresses} style={{ marginTop: '1rem' }}>
                {showAllAddresses ? 'Ver menos' : 'Ver todos'}
              </button>
            )}
          </Card>
        )}

        <form className={styles['address-modal-form']} onSubmit={handleSubmit}>
          <Card title="CEP">
            <CustomInput
              title="Código de Endereço Postal"
              type="text"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              bottomRightLink={{ href: '/zip-code-search', text: 'Não sei o meu CEP' }}
            />
          </Card>
          <button type="submit" className={styles['address-modal-save-button']}>
            Salvar modificações
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddressModal;
