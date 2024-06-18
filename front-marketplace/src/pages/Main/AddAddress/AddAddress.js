import React, { useState, useCallback, memo, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import { Helmet } from 'react-helmet-async';
import { addAddress, getAddressClassifications, getUserProfile } from '../../../services/profileApi';
import ClassificationSelect from '../../../components/UI/ClassificationSelect/ClassificationSelect';
import './AddAddress.css';
import axios from 'axios';
import { NotificationContext } from '../../../context/NotificationContext';

const AddAddress = () => {
    const { setMessage } = useContext(NotificationContext);
    const [formData, setFormData] = useState({
        recipientName: '',
        recipientPhone: '',
        cep: '',
        state: '',
        city: '',
        neighborhood: '',
        street: '',
        number: '',
        complement: '',
        classification: '',
        moreInformation: ''
    });
    const [noNumber, setNoNumber] = useState(false);
    const [classifications, setClassifications] = useState([]);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;
    const [isFormValid, setIsFormValid] = useState(false);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value }));
    }, []);

    const handlePhoneChange = useCallback((value) => {
        setFormData(prevFormData => ({ ...prevFormData, recipientPhone: value }));
    }, []);

    const handleNumberChange = useCallback((e) => {
        const { value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, number: value }));
    }, []);

    const handleCheckboxChange = useCallback(() => {
        setNoNumber(!noNumber);
        setFormData(prevFormData => ({ ...prevFormData, number: !noNumber ? 'SN' : '' }));
    }, [noNumber]);

    const handleClassificationChange = useCallback((classification) => {
        setFormData(prevFormData => ({ ...prevFormData, classification }));
    }, []);

    const fetchAddress = useCallback(async (cep) => {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const { uf, localidade, bairro, logradouro } = response.data;
            setFormData(prevFormData => ({
                ...prevFormData,
                state: uf,
                city: localidade,
                neighborhood: bairro,
                street: logradouro,
            }));
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            setMessage('Erro ao buscar endereço. Verifique o CEP e tente novamente.', 'error');
        }
    }, [setMessage]);

    const handleCepChange = useCallback((e) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/\D/g, ''); // Remove pontos e traços
        setFormData(prevFormData => ({ ...prevFormData, cep: sanitizedValue }));

        if (sanitizedValue.length === 8) {
            fetchAddress(sanitizedValue);
        }
    }, [fetchAddress]);

    const handleFillWithProfile = useCallback(async () => {
        try {
            const profile = await getUserProfile();
            setFormData(prevFormData => ({
                ...prevFormData,
                recipientName: profile.name,
                recipientPhone: profile.phone
            }));
        } catch (error) {
            console.error('Erro ao buscar perfil do usuário:', error);
            setMessage('Erro ao buscar perfil do usuário. Tente novamente.', 'error');
        }
    }, [setMessage]);

    useEffect(() => {
        const { recipientName, recipientPhone, cep, state, city, neighborhood, street, number, classification } = formData;
        setIsFormValid(
            recipientName !== '' &&
            recipientPhone !== '' &&
            cep !== '' &&
            state !== '' &&
            city !== '' &&
            neighborhood !== '' &&
            street !== '' &&
            number !== '' &&
            classification !== ''
        );
    }, [formData]);

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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            setMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        try {
            await addAddress(formData);
            setMessage('Endereço adicionado com sucesso!', 'success');
            navigate('/address'); // Redireciona o usuário para a rota /address
        } catch (error) {
            console.error('Erro ao adicionar endereço:', error);
            setMessage('Erro ao adicionar endereço. Tente novamente.', 'error');
        }
    }, [formData, isFormValid, navigate, setMessage]);

    return (
        <div className="add-address-page">
            <Helmet>
                <title>Adicionar Endereço - Nilrow</title>
                <meta name="description" content="Adicione um novo endereço na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Adicionar Endereço" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="add-address-container">
                <SubHeader title="Adicionar Endereço" handleBack={handleBack} />
                <form onSubmit={handleSubmit}>
                    <Card 
                        title="Quem vai receber?" 
                        rightButton={{ text: "Eu mesmo", onClick: handleFillWithProfile }}
                    >
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
                                    autoFocus: true
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
                            value={formData.cep}
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
                            checkbox={{ // Adicionado checkbox
                                checked: noNumber,
                                onChange: handleCheckboxChange,
                                label: 'Sem número'
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
                            text="Adicionar Endereço"
                            backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(AddAddress);
