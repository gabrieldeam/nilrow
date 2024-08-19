import React, { useCallback, useState, memo, useContext, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CustomSelect from '../../../../components/UI/CustomSelect/CustomSelect';
import CustomInput from '../../../../components/UI/CustomInput/CustomInput';
import Card from '../../../../components/UI/Card/Card';
import StageButton from '../../../../components/UI/Buttons/StageButton/StageButton';
import MobileHeader from '../../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../../components/Main/SubHeader/SubHeader';
import SeeData from '../../../../components/UI/SeeData/SeeData';
import { Helmet } from 'react-helmet-async';
import './EditCatalog.css';
import { NotificationContext } from '../../../../context/NotificationContext';
import { getCatalogByCatalogId, editCatalog, deleteCatalog } from '../../../../services/catalogApi';
import { getAddressById } from '../../../../services/profileApi';
import closeIcon from '../../../../assets/close.svg';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

const EditCatalog = () => {
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = window.innerWidth <= 768;
    const [catalogId, setCatalogId] = useState(null);

    const handleBack = useCallback(() => {
        navigate('/my-catalog');
    }, [navigate]);

    const handleDelete = useCallback(async () => {
        try {
            await deleteCatalog(catalogId);
            setMessage('Catálogo deletado com sucesso!', 'success');
            navigate('/catalog');
        } catch (error) {
            setMessage('Erro ao deletar o catálogo. Tente novamente.', 'error');
            console.error('Erro ao deletar o catálogo:', error);
        }
    }, [catalogId, navigate, setMessage]);

    const daysOfWeek = useMemo(() => ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'], []);
    const fullDaysOfWeek = useMemo(() => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'], []);

    const [selectedDay, setSelectedDay] = useState(null);
    const [dayData, setDayData] = useState(
        fullDaysOfWeek.map(() => ({ openCloseTimes: [{ open: '', close: '' }], is24Hours: false, isClosed: false }))
    );

    const [selectedOption, setSelectedOption] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        nameBoss: '',
        cnpj: '',
        email: '',
        phone: '',
        addressId: null,
        addressStreet: '',
        addressCep: '',
        addressCity: '',
        addressState: '',
        addressRecipientName: '',
        addressRecipientPhone: ''
    });
    const [isFormValid, setIsFormValid] = useState(false);

    useEffect(() => {
        const id = location.state?.catalogId || localStorage.getItem('selectedCatalogId');
        const {
            selectedAddressId,
            selectedAddressStreet,
            selectedAddressCep,
            selectedAddressCity,
            selectedAddressState,
            selectedAddressRecipientName,
            selectedAddressRecipientPhone,
        } = location.state || {};

        if (id) {
            setCatalogId(id);

            const isAddressSelected = selectedAddressId !== undefined;

            getCatalogByCatalogId(id).then(async (catalog) => {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    name: catalog.name,
                    nameBoss: catalog.nameBoss,
                    cnpj: catalog.cnpj,
                    email: catalog.email,
                    phone: catalog.phone,
                    addressId: isAddressSelected ? selectedAddressId : catalog.addressId,
                    addressStreet: isAddressSelected ? selectedAddressStreet : prevFormData.addressStreet,
                    addressCep: isAddressSelected ? selectedAddressCep : prevFormData.addressCep,
                    addressCity: isAddressSelected ? selectedAddressCity : prevFormData.addressCity,
                    addressState: isAddressSelected ? selectedAddressState : prevFormData.addressState,
                    addressRecipientName: isAddressSelected ? selectedAddressRecipientName : prevFormData.addressRecipientName,
                    addressRecipientPhone: isAddressSelected ? selectedAddressRecipientPhone : prevFormData.addressRecipientPhone,
                }));

                if (!isAddressSelected && catalog.addressId) {
                    try {
                        const address = await getAddressById(catalog.addressId);
                        setFormData((prevFormData) => ({
                            ...prevFormData,
                            addressStreet: address.street,
                            addressCep: address.cep,
                            addressCity: address.city,
                            addressState: address.state,
                            addressRecipientName: address.recipientName,
                            addressRecipientPhone: address.recipientPhone,
                        }));
                    } catch (error) {
                        console.error('Erro ao buscar as informações do endereço:', error);
                        setMessage('Erro ao carregar as informações do endereço.', 'error');
                    }
                }

                const orderedOperatingHours = fullDaysOfWeek.map((day) => {
                    const dayData = catalog.operatingHours.find((oh) => oh.dayOfWeek === day);
                    return dayData
                        ? {
                              openCloseTimes:
                                  dayData.timeIntervals.length > 0
                                      ? dayData.timeIntervals.map((time) => ({
                                            open: time.openTime,
                                            close: time.closeTime,
                                        }))
                                      : [{ open: '', close: '' }],
                              is24Hours: dayData.is24Hours,
                              isClosed: dayData.closed,
                          }
                        : { openCloseTimes: [{ open: '', close: '' }], is24Hours: false, isClosed: false };
                });

                setDayData(orderedOperatingHours);

                if (
                    orderedOperatingHours[0].openCloseTimes.some((time) => time.open || time.close) ||
                    orderedOperatingHours[0].is24Hours ||
                    orderedOperatingHours[0].isClosed
                ) {
                    setSelectedDay(0);
                }

                switch (catalog.operatingHoursType) {
                    case 'NORMAL_HOURS':
                        setSelectedOption('normal');
                        break;
                    case 'NO_NORMAL_HOURS':
                        setSelectedOption('noHours');
                        break;
                    case 'TEMPORARILY_CLOSED':
                        setSelectedOption('temporaryClosed');
                        break;
                    case 'PERMANENTLY_CLOSED':
                        setSelectedOption('permanentClosed');
                        break;
                    default:
                        setSelectedOption('');
                        break;
                }
            }).catch((error) => {
                console.error('Erro ao buscar as informações do catálogo:', error);
                setMessage('Erro ao carregar as informações do catálogo.', 'error');
                navigate('/my-catalog');
            });
        } else {
            navigate('/my-catalog');
        }
    }, [location.state, navigate, setMessage, fullDaysOfWeek]);

    useEffect(() => {
        const { name, nameBoss, cnpj, email, phone } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cnpjRegex = /^\d{14}$/;
        const isNameValid = name !== '' && name.length <= 65;
        const isNameBossValid = nameBoss !== '' && nameBoss.length <= 65;
        const isEmailValid = email !== '' && emailRegex.test(email);
        const isCnpjValid = cnpj !== '' && cnpjRegex.test(cnpj.replace(/[^\d]/g, ''));
        const isPhoneValid = phone !== '';

        setIsFormValid(isNameValid && isNameBossValid && isEmailValid && isCnpjValid && isPhoneValid);
    }, [formData]);

    const handleDayClick = (dayIndex) => {
        setSelectedDay(dayIndex === selectedDay ? null : dayIndex);
    };

    const handleInputChange = (dayIndex, timeIndex, name, value) => {
        const newDayData = [...dayData];
        newDayData[dayIndex].openCloseTimes[timeIndex][name] = value;
        setDayData(newDayData);
    };

    const handleToggle = (dayIndex, field) => {
        const newDayData = [...dayData];
        newDayData[dayIndex][field] = !newDayData[dayIndex][field];
        if (field === 'is24Hours' && newDayData[dayIndex][field]) {
            newDayData[dayIndex].isClosed = false;
            newDayData[dayIndex].openCloseTimes = [{ open: '', close: '' }];
        } else if (field === 'isClosed' && newDayData[dayIndex][field]) {
            newDayData[dayIndex].is24Hours = false;
            newDayData[dayIndex].openCloseTimes = [{ open: '', close: '' }];
        }
        setDayData(newDayData);
    };

    const addOpenCloseTime = (dayIndex) => {
        const newDayData = [...dayData];
        newDayData[dayIndex].openCloseTimes.push({ open: '', close: '' });
        setDayData(newDayData);
    };

    const removeOpenCloseTime = (dayIndex, timeIndex) => {
        const newDayData = [...dayData];
        newDayData[dayIndex].openCloseTimes.splice(timeIndex, 1);
        setDayData(newDayData);
    };

    const handleOptionChange = (option) => {
        setSelectedOption(option);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateForm = useCallback(() => {
        const { name, nameBoss, cnpj, email, phone, addressId } = formData;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const cnpjRegex = /^\d{14}$/;

        if (!name || name.length > 65) {
            setMessage('Nome do catálogo é obrigatório e deve ter no máximo 65 caracteres.', 'error');
            return false;
        }

        if (!nameBoss || nameBoss.length > 65) {
            setMessage('Nome empresarial é obrigatório e deve ter no máximo 65 caracteres.', 'error');
            return false;
        }

        if (!email || !emailRegex.test(email)) {
            setMessage('Email é obrigatório e deve ser válido.', 'error');
            return false;
        }

        if (!cnpj || !cnpjRegex.test(cnpj.replace(/[^\d]/g, ''))) {
            setMessage('CNPJ é obrigatório e deve ser válido.', 'error');
            return false;
        }

        if (!phone) {
            setMessage('Telefone é obrigatório.', 'error');
            return false;
        }

        if (!addressId) {
            setMessage('Endereço é obrigatório.', 'error');
            return false;
        }

        if (!selectedOption) {
            setMessage('Você deve selecionar um tipo de horário de funcionamento.', 'error');
            return false;
        }

        if (selectedOption === 'normal') {
            const isAllDaysConfigured = dayData.every(
                (day) =>
                    day.is24Hours ||
                    day.isClosed ||
                    day.openCloseTimes.every((time) => time.open && time.close)
            );

            if (!isAllDaysConfigured) {
                setMessage('Você deve configurar todos os dias quando escolher "Aberto com horário normal".', 'error');
                return false;
            }
        }

        return true;
    }, [formData, selectedOption, dayData, setMessage]);

    const handleSubmit = useCallback(
        async (e) => {
            e.preventDefault();
            if (validateForm()) {
                const operatingHours =
                    selectedOption === 'normal'
                        ? dayData.map((day, index) => ({
                              dayOfWeek: fullDaysOfWeek[index],
                              timeIntervals:
                                  day.is24Hours || day.isClosed
                                      ? []
                                      : day.openCloseTimes.map((time) => ({
                                            openTime: time.open,
                                            closeTime: time.close,
                                        })),
                              is24Hours: day.is24Hours,
                              closed: day.isClosed,
                          }))
                        : [];

                let operatingHoursType = '';
                switch (selectedOption) {
                    case 'normal':
                        operatingHoursType = 'NORMAL_HOURS';
                        break;
                    case 'noHours':
                        operatingHoursType = 'NO_NORMAL_HOURS';
                        break;
                    case 'temporaryClosed':
                        operatingHoursType = 'TEMPORARILY_CLOSED';
                        break;
                    case 'permanentClosed':
                        operatingHoursType = 'PERMANENTLY_CLOSED';
                        break;
                    default:
                        setMessage('Tipo de horário de funcionamento inválido.', 'error');
                        return;
                }

                const catalogData = {
                    name: formData.name,
                    nameBoss: formData.nameBoss,
                    cnpj: formData.cnpj,
                    email: formData.email,
                    phone: formData.phone,
                    addressId: formData.addressId,
                    operatingHoursType: operatingHoursType,
                    operatingHours: operatingHours,
                };

                try {
                    await editCatalog(catalogId, catalogData);
                    setMessage('Catálogo editado com sucesso!', 'success');
                    navigate('/my-catalog');
                } catch (error) {
                    if (error.response && error.response.data) {
                        const errorMessage =
                            error.response.data.message || 'Erro ao editar o catálogo. Tente novamente.';
                        setMessage(errorMessage, 'error');
                    } else {
                        setMessage('Erro ao editar o catálogo. Tente novamente.', 'error');
                    }
                    console.error('Erro ao editar o catálogo:', error);
                }
            }
        },
        [catalogId, formData, selectedOption, dayData, fullDaysOfWeek, setMessage, navigate, validateForm]
    );

    const handleSelectAddress = (e) => {
        e.preventDefault();
        const formDataWithTimestamp = {
            data: formData,
            timestamp: new Date().getTime(),
        };
        localStorage.setItem('editCatalogFormData', JSON.stringify(formDataWithTimestamp));
        navigate('/address', { state: { selectMode: true, returnTo: `/edit-catalog/${catalogId}` } });
    };

    return (
        <div className="add-catalog-page">
            <Helmet>
                <title>Editar Catálogo</title>
                <meta name="description" content="Edite um catálogo existente." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Editar Catálogo" buttons={{ close: true, delete: true }} handleBack={handleBack} onDelete={handleDelete} />
            )}
            <div className="add-catalog-container">
                <SubHeader title="Editar Catálogo" handleBack={handleBack} showDeleteButton={true} handleDelete={handleDelete}/>
                <form onSubmit={handleSubmit}>
                    <Card title="Dados">
                        <CustomInput
                            title="Nome do catálogo"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                        />
                        <CustomInput
                            title="Nome empresarial"
                            type="text"
                            bottomLeftText="Final LTDA, MEI, LLM"
                            name="nameBoss"
                            value={formData.nameBoss}
                            onChange={handleFormChange}
                        />
                        <CustomInput
                            title="CNPJ"
                            type="text"
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleFormChange}
                        />
                        <CustomInput
                            title="E-mail"
                            type="text"
                            name="email"
                            bottomLeftText="Certifique-se de que você tenha acesso a ele"
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                        <div className="custom-input-container-phone">
                            <label className="input-title-phone">Telefone</label>
                            <PhoneInput
                                country={'br'}
                                value={formData.phone}
                                onChange={(phone) => setFormData({ ...formData, phone })}
                                inputProps={{
                                    name: 'phone',
                                    required: true,
                                    autoFocus: true,
                                }}
                                inputClass="phone-input"
                                buttonClass="phone-input-button"
                                dropdownClass="phone-input-dropdown"
                                containerClass="phone-input-container"
                            />
                            <div className="input-bottom-text">
                                <span className="bottom-left-phone">Vamos te enviar informações por WhatsApp</span>
                            </div>
                        </div>
                    </Card>
                    <Card title="Endereço de origem">
                        <SeeData
                            title={formData.addressStreet || 'Selecionar Endereço'}
                            content={
                                formData.addressCep
                                    ? `CEP: ${formData.addressCep} - ${formData.addressCity}/${formData.addressState}`
                                    : 'Nenhum endereço selecionado'
                            }
                            subContent={
                                formData.addressRecipientName
                                    ? `${formData.addressRecipientName} - ${formData.addressRecipientPhone}`
                                    : ''
                            }
                            stackContent={true}
                            linkText="Selecionar"
                            onClick={handleSelectAddress}
                        />
                    </Card>
                    <Card title="Funcionamento">
                        <div className="selection-see-data-wrapper">
                            <SeeData
                                title="Aberto com horário normal"
                                content="Mostrar quando sua empresa está aberta"
                                stackContent={true}
                                showToggleButton={true}
                                toggled={selectedOption === 'normal'}
                                onToggle={() => handleOptionChange('normal')}
                            />
                            {selectedOption === 'normal' && (
                                <>
                                    <label className="days-selection-label">Selecionar dias</label>
                                    <div className="days-selection">
                                        {daysOfWeek.map((day, index) => (
                                            <div
                                                key={index}
                                                className={`day-box ${selectedDay === index ? 'selected' : ''}`}
                                                onClick={() => handleDayClick(index)}
                                            >
                                                {day}
                                            </div>
                                        ))}
                                    </div>
                                    {selectedDay !== null && (
                                        <div key={selectedDay} className="day-details">
                                            <h4>{fullDaysOfWeek[selectedDay]}</h4>
                                            <div className="hour-see-data-wrapper">
                                                <SeeData
                                                    content="Aberto 24 horas"
                                                    stackContent={true}
                                                    showToggleButton={true}
                                                    toggled={dayData[selectedDay].is24Hours}
                                                    onToggle={() => handleToggle(selectedDay, 'is24Hours')}
                                                />
                                                <SeeData
                                                    content="Fechado"
                                                    stackContent={true}
                                                    showToggleButton={true}
                                                    toggled={dayData[selectedDay].isClosed}
                                                    onToggle={() => handleToggle(selectedDay, 'isClosed')}
                                                />
                                            </div>
                                            {!dayData[selectedDay].is24Hours &&
                                                !dayData[selectedDay].isClosed &&
                                                Array.isArray(dayData[selectedDay].openCloseTimes) &&
                                                dayData[selectedDay].openCloseTimes.map((time, timeIndex) => (
                                                    <div key={timeIndex} className="open-close-see-data-wrapper">
                                                        <CustomSelect
                                                            title="Abre"
                                                            name={`open-${selectedDay}-${timeIndex}`}
                                                            value={time.open}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    selectedDay,
                                                                    timeIndex,
                                                                    'open',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <CustomSelect
                                                            title="Fecha"
                                                            name={`close-${selectedDay}-${timeIndex}`}
                                                            value={time.close}
                                                            onChange={(e) =>
                                                                handleInputChange(
                                                                    selectedDay,
                                                                    timeIndex,
                                                                    'close',
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                        <img
                                                            src={closeIcon}
                                                            alt="Remover"
                                                            className="remove-time-button"
                                                            onClick={() =>
                                                                removeOpenCloseTime(selectedDay, timeIndex)
                                                            }
                                                        />
                                                    </div>
                                                ))}
                                            {!dayData[selectedDay].is24Hours &&
                                                !dayData[selectedDay].isClosed && (
                                                    <button
                                                        type="button"
                                                        className="add-time-button"
                                                        onClick={() => addOpenCloseTime(selectedDay)}
                                                    >
                                                        + Adicionar horário
                                                    </button>
                                                )}
                                        </div>
                                    )}
                                </>
                            )}
                            <SeeData
                                title="Aberto sem horário normal"
                                content="Não mostrar o horário de funcionemento"
                                stackContent={true}
                                showToggleButton={true}
                                toggled={selectedOption === 'noHours'}
                                onToggle={() => handleOptionChange('noHours')}
                            />
                            <SeeData
                                title="Temporariamente fechado"
                                content="Mostrar que sua empresa será reaberta no futuro"
                                stackContent={true}
                                showToggleButton={true}
                                toggled={selectedOption === 'temporaryClosed'}
                                onToggle={() => handleOptionChange('temporaryClosed')}
                            />
                            <SeeData
                                title="Permanentemente fechado"
                                content="Mostrar que sua empresa não existe mais"
                                stackContent={true}
                                showToggleButton={true}
                                toggled={selectedOption === 'permanentClosed'}
                                onToggle={() => handleOptionChange('permanentClosed')}
                            />
                        </div>
                    </Card>
                    <div className="confirmationButton-space">
                        <StageButton text="Salvar" backgroundColor={isFormValid ? '#7B33E5' : '#212121'} type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(EditCatalog);
