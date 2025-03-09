'use client';

import React, {
  useCallback,
  useState,
  useEffect,
  FormEvent,
  ChangeEvent,
} from 'react';
import Head from 'next/head';
import { useRouter, useParams } from 'next/navigation';
import axios from 'axios';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import AuthFooter from '@/components/Layout/AuthFooter/AuthFooter';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import ClassificationSelect from '@/components/UI/ClassificationSelect/ClassificationSelect';

import {
  getAddressById,
  updateAddress,
  getAddressClassifications,
  deleteAddress,
} from '@/services/profileService';

import { useNotification } from '@/hooks/useNotification';

import styles from './editAddress.module.css';

interface ClassificationData {
  id: string;
  name: string;
  value: string;
}

function EditAddressPage() {
  const router = useRouter();
  const { id } = useParams() as { id: string };
  const { setMessage } = useNotification();

  const [formData, setFormData] = useState({
    recipientName: '',
    recipientPhone: '',
    zipCode: '',
    state: '',
    city: '',
    neighborhood: '',
    street: '',
    number: '',
    complement: '',
    classification: '',
    moreInformation: '',
  });

  const [noNumber, setNoNumber] = useState(false);
  const [classifications, setClassifications] = useState<ClassificationData[]>([]);

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  const [isFormValid, setIsFormValid] = useState(false);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleDelete = useCallback(async () => {
    try {
      await deleteAddress(id);
      setMessage('Endereço deletado com sucesso!', 'success');
      router.push('/profile/address');
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      setMessage('Erro ao deletar endereço. Tente novamente.', 'error');
    }
  }, [id, router, setMessage]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value || '' }));
    },
    []
  );

  const handlePhoneChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, recipientPhone: value || '' }));
  }, []);

  const handleNumberChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, number: value || '' }));
    },
    []
  );

  const handleCheckboxChange = useCallback(() => {
    setNoNumber((prev) => !prev);
    setFormData((prev) => ({
      ...prev,
      number: !noNumber ? 'SN' : '',
    }));
  }, [noNumber]);

  const handleClassificationChange = useCallback((classification: string) => {
    setFormData((prev) => ({ ...prev, classification: classification || '' }));
  }, []);

  const fetchAddress = useCallback(
    async (cep: string) => {
      try {
        const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        const { uf, localidade, bairro, logradouro } = response.data;
        setFormData((prev) => ({
          ...prev,
          state: uf || '',
          city: localidade || '',
          neighborhood: bairro || '',
          street: logradouro || '',
        }));
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        setMessage(
          'Erro ao buscar endereço. Verifique o CEP e tente novamente.',
          'error'
        );
      }
    },
    [setMessage]
  );

  const handleCepChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = e.target;
      const sanitizedValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, cep: sanitizedValue || '' }));

      if (sanitizedValue.length === 8) {
        fetchAddress(sanitizedValue);
      }
    },
    [fetchAddress]
  );

  useEffect(() => {
    const fetchClassifications = async () => {
      try {
        const data = await getAddressClassifications();
        setClassifications(data);
      } catch (error) {
        console.error('Erro ao buscar classificações de endereço:', error);
        setMessage('Erro ao buscar classificações de endereço.', 'error');
      }
    };

    fetchClassifications();
  }, [setMessage]);

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const address = await getAddressById(id);
        setFormData({
          recipientName: address.recipientName || '',
          recipientPhone: address.recipientPhone || '',
          zipCode: address.cep || '',
          state: address.state || '',
          city: address.city || '',
          neighborhood: address.neighborhood || '',
          street: address.street || '',
          number: address.number || '',
          complement: address.complement || '',
          classification: address.classification || '',
          moreInformation: address.moreInformation || '',
        });
        if (address.number === 'SN') {
          setNoNumber(true);
        }
      } catch (error) {
        console.error('Erro ao buscar endereço:', error);
        setMessage('Erro ao buscar endereço. Tente novamente.', 'error');
      }
    };

    fetchAddressData();
  }, [id, setMessage]);

  useEffect(() => {
    const {
      recipientName,
      recipientPhone,
      zipCode,
      state,
      city,
      neighborhood,
      street,
      number,
      classification,
    } = formData;

    setIsFormValid(
      recipientName !== '' &&
        recipientPhone !== '' &&
        zipCode !== '' &&
        state !== '' &&
        city !== '' &&
        neighborhood !== '' &&
        street !== '' &&
        number !== '' &&
        classification !== ''
    );
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!isFormValid) {
        setMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
      }

      try {
        await updateAddress(id, formData);
        setMessage('Endereço atualizado com sucesso!', 'success');
        router.push('/profile/address');
      } catch (error) {
        console.error('Erro ao atualizar endereço:', error);
        setMessage('Erro ao atualizar endereço. Tente novamente.', 'error');
      }
    },
    [id, formData, isFormValid, router, setMessage]
  );

  return (
    <div className={styles['edit-address-page']}>
      <Head>
        <title>Editar Endereço</title>
        <meta name="description" content="Edite seu endereço na Nilrow." />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Editar Endereço"
          buttons={{ close: true, delete: true }}
          handleBack={handleBack}
          onDelete={handleDelete}
        />
      )}

      <div className={styles['edit-address-container']}>
        <SubHeader
          title="Editar Endereço"
          handleBack={handleBack}
          showDeleteButton={true}
          handleDelete={handleDelete}
        />

        <form onSubmit={handleSubmit}>
          <Card title="Quem vai receber?">
            <CustomInput
              title="Nome completo"
              type="text"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleChange}
            />

            <div className="custom-input-container-phone">
              <label className="input-title-phone">Telefone</label>
              <PhoneInput
                country={'br'}
                value={formData.recipientPhone}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'recipientPhone',
                  required: true,
                  autoFocus: true,
                }}
                inputClass="phone-input"
                buttonClass="phone-input-button"
                dropdownClass="phone-input-dropdown"
                containerClass="phone-input-container"
              />
            </div>
          </Card>

          <Card title="Endereço">
            <CustomInput
              title="Código de Endereço Postal"
              type="text"
              name="cep"
              value={formData.zipCode}
              onChange={handleCepChange}
              bottomLeftText="Informe seu CEP"
            />
            <CustomInput
              title="Estado"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              readOnly={true}
            />
            <CustomInput
              title="Cidade"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              readOnly={true}
            />
            <CustomInput
              title="Bairro"
              type="text"
              name="neighborhood"
              value={formData.neighborhood}
              onChange={handleChange}
            />
            <CustomInput
              title="Rua/Avenida"
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
            />

            <CustomInput
              title="Número"
              type="text"
              name="number"
              value={formData.number}
              onChange={handleNumberChange}
              readOnly={noNumber}
              checkbox={{
                checked: noNumber,
                onChange: handleCheckboxChange,
                label: 'Sem número',
              }}
            />

            <CustomInput
              title="Complemento"
              type="text"
              name="complement"
              value={formData.complement}
              onChange={handleChange}
              bottomLeftText="Opcional"
            />
          </Card>

          <Card title="Classificar">
            <ClassificationSelect
              classifications={classifications}
              selectedClassification={formData.classification}
              onChange={handleClassificationChange}
            />
          </Card>

          <Card title="Mais">
            <CustomInput
              title="Informações adicionais"
              type="text"
              name="moreInformation"
              value={formData.moreInformation}
              onChange={handleChange}
              bottomLeftText="Opcional"
            />
          </Card>

          <div className="confirmationButton-space">
            <StageButton
              text="Atualizar Endereço"
              backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
              type="submit"
            />
          </div>
        </form>
      </div>

      <AuthFooter />
    </div>
  );
}

export default EditAddressPage;
