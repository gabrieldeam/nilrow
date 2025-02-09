import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CustomInput from '../../../../components/UI/CustomInput/CustomInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Card from '../../../../components/UI/Card/Card';
import StageButton from '../../../../components/UI/Buttons/StageButton/StageButton';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import AuthFooter from '../../../../components/Auth/AuthFooter/AuthFooter';
import { Helmet } from 'react-helmet-async';
import { getAddressById, updateAddress, getAddressClassifications, deleteAddress } from '../../../../services/profileApi'; // Importe deleteAddress
import ClassificationSelect from '../../../../components/UI/ClassificationSelect/ClassificationSelect';
import '../AddAddress/AddAddress.css'; 
import { NotificationContext } from '../../../../context/NotificationContext';
import axios from 'axios';

const EditAddress = () => {
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
    const { id } = useParams();
    const isMobile = window.innerWidth <= 768;
    const [isFormValid, setIsFormValid] = useState(false);

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleDelete = useCallback(async () => {
        try {
            await deleteAddress(id);
            setMessage('Endereço deletado com sucesso!', 'success');
            navigate('/address');
        } catch (error) {
            console.error('Erro ao deletar endereço:', error);
            setMessage('Erro ao deletar endereço. Tente novamente.', 'error');
        }
    }, [id, navigate, setMessage]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, [name]: value || '' }));
    }, []);

    const handlePhoneChange = useCallback((value) => {
        setFormData(prevFormData => ({ ...prevFormData, recipientPhone: value || '' }));
    }, []);

    const handleNumberChange = useCallback((e) => {
        const { value } = e.target;
        setFormData(prevFormData => ({ ...prevFormData, number: value || '' }));
    }, []);

    const handleCheckboxChange = useCallback(() => {
        setNoNumber(!noNumber);
        setFormData(prevFormData => ({ ...prevFormData, number: !noNumber ? 'SN' : '' }));
    }, [noNumber]);

    const handleClassificationChange = useCallback((classification) => {
        setFormData(prevFormData => ({ ...prevFormData, classification: classification || '' }));
    }, []);

    const fetchAddress = useCallback(async (cep) => {
        try {
            const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
            const { uf, localidade, bairro, logradouro } = response.data;
            setFormData(prevFormData => ({
                ...prevFormData,
                state: uf || '',
                city: localidade || '',
                neighborhood: bairro || '',
                street: logradouro || '',
            }));
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            setMessage('Erro ao buscar endereço. Verifique o CEP e tente novamente.', 'error');
        }
    }, [setMessage]);

    const handleCepChange = useCallback((e) => {
        const { value } = e.target;
        const sanitizedValue = value.replace(/\D/g, ''); // Remove pontos e traços
        setFormData(prevFormData => ({ ...prevFormData, cep: sanitizedValue || '' }));

        if (sanitizedValue.length === 8) {
            fetchAddress(sanitizedValue);
        }
    }, [fetchAddress]);

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
                    cep: address.cep || '',
                    state: address.state || '',
                    city: address.city || '',
                    neighborhood: address.neighborhood || '',
                    street: address.street || '',
                    number: address.number || '',
                    complement: address.complement || '',
                    classification: address.classification || '',
                    moreInformation: address.moreInformation || ''
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

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!isFormValid) {
            setMessage('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }

        try {
            await updateAddress(id, formData);
            setMessage('Endereço atualizado com sucesso!', 'success');
            navigate('/address');
        } catch (error) {
            console.error('Erro ao atualizar endereço:', error);
            setMessage('Erro ao atualizar endereço. Tente novamente.', 'error');
        }
    }, [formData, isFormValid, id, navigate, setMessage]);

    return (
        <div className="edit-address-page">
            <Helmet>
                <title>Editar Endereço</title>
                <meta name="description" content="Edite seu endereço na Nilrow." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Editar Endereço" buttons={{ close: true, delete: true }} handleBack={handleBack} onDelete={handleDelete} />
            )}
            <div className="edit-address-container">
                <SubHeader title="Editar Endereço" handleBack={handleBack} showDeleteButton={true} handleDelete={handleDelete} />
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
                            checkbox={{ 
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
                            text="Atualizar Endereço"
                            backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                            type="submit"
                        />
                    </div>
                </form>
            </div>
            <AuthFooter/>
        </div>
    );
};

export default EditAddress;
