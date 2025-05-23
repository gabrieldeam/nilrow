'use client';

import React, {
  useCallback,
  useState,
  memo,
  useEffect,
  useMemo,
} from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Head from 'next/head';
import Image from 'next/image';
import CustomSelect from '@/components/UI/CustomSelect/CustomSelect';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import SeeData from '@/components/UI/SeeData/SeeData';

import { useNotification } from '@/hooks/useNotification';

import { getCatalogByCatalogId, editCatalog, deleteCatalog } from '@/services/catalogService';
import { getAddressById } from '@/services/profileService';

import closeIcon from '../../../../../../../public/assets/close.svg';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import styles from './EditCatalog.module.css';

const EditCatalog = () => {
  const { setMessage } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { catalogId: routeCatalogId } = useParams();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const [catalogId, setCatalogId] = useState(null);

  const timeOptions = Array.from({ length: 24 * 2 }, (_, index) => {
    const totalMinutes = index * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedHour =
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0');
    return { label: formattedHour, value: formattedHour };
  });

  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my');
  }, [router]);

  const handleDelete = useCallback(async () => {
    try {
      if (!catalogId) return;
      await deleteCatalog(catalogId);
      setMessage('Catálogo deletado com sucesso!', 'success');
      router.push('/channel/catalog');
    } catch (error) {
      setMessage('Erro ao deletar o catálogo. Tente novamente.', 'error');
      console.error('Erro ao deletar o catálogo:', error);
    }
  }, [catalogId, router, setMessage]);

  const daysOfWeek = useMemo(() => ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'], []);
  const fullDaysOfWeek = useMemo(
    () => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    []
  );

  const [selectedDay, setSelectedDay] = useState(null);
  const [dayInfo, setDayInfo] = useState(
    fullDaysOfWeek.map(() => ({
      openCloseTimes: [{ open: '', close: '' }],
      is24Hours: false,
      isClosed: false,
    }))
  );

  const [selectedOption, setSelectedOption] = useState('');
  const [CatalogData, setCatalogDTO] = useState({
    title: '',
    description: '',
    isVisible: false,
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
    addressRecipientPhone: '',
  });
  const [isFormValid, setIsFormValid] = useState(false);

  // Captura os parâmetros de endereço da URL e atualiza o estado
  useEffect(() => {
    const selectedAddressId = searchParams.get('selectedAddressId');
    const selectedAddressStreet = searchParams.get('selectedAddressStreet');
    const selectedAddressCep = searchParams.get('selectedAddressCep');
    const selectedAddressCity = searchParams.get('selectedAddressCity');
    const selectedAddressState = searchParams.get('selectedAddressState');
    const selectedAddressRecipientName = searchParams.get('selectedAddressRecipientName');
    const selectedAddressRecipientPhone = searchParams.get('selectedAddressRecipientPhone');

    if (selectedAddressId) {
      console.log('Novo ID de endereço selecionado:', selectedAddressId);
      setCatalogDTO((prev) => ({
        ...prev,
        addressId: selectedAddressId,
        addressStreet: selectedAddressStreet || '',
        addressCep: selectedAddressCep || '',
        addressCity: selectedAddressCity || '',
        addressState: selectedAddressState || '',
        addressRecipientName: selectedAddressRecipientName || '',
        addressRecipientPhone: selectedAddressRecipientPhone || '',
      }));
    }
  }, [searchParams]);

  // Carrega os dados do catálogo ao iniciar
  useEffect(() => {
    const catalogIdFromQuery = searchParams.get('catalogId');
    const id = routeCatalogId || catalogIdFromQuery || localStorage.getItem('selectedCatalogId');
    if (id) {
      setCatalogId(id);
      getCatalogByCatalogId(id)
        .then(async (catalog) => {
          const catalogResponse = catalog;
          const newAddressId = searchParams.get('selectedAddressId');
          setCatalogDTO((prev) => ({
            ...prev,
            name: catalogResponse.name,
            nameBoss: catalogResponse.nameBoss,
            cnpj: catalogResponse.cnpj,
            email: catalogResponse.email,
            phone: catalogResponse.phone,
            addressId: newAddressId ? newAddressId : catalogResponse.addressId, // Preserva o addressId da URL, se existir
          }));

          console.log(
            'Endereço enviado para edição (do catálogo):',
            newAddressId ? newAddressId : catalogResponse.addressId
          );

          // Se não há parâmetros de endereço na URL, busca os dados do endereço existente
          if (!searchParams.get('selectedAddressId') && catalogResponse.addressId) {
            try {
              const address = await getAddressById(String(catalogResponse.addressId));
              setCatalogDTO((prev) => ({
                ...prev,
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
            const dayOp = catalogResponse.operatingHours.find((oh) => oh.dayOfWeek === day);
            return dayOp
              ? {
                  openCloseTimes:
                    dayOp.timeIntervals && dayOp.timeIntervals.length > 0
                      ? dayOp.timeIntervals.map((time) => ({
                          open: time.openTime,
                          close: time.closeTime,
                        }))
                      : [{ open: '', close: '' }],
                  is24Hours: dayOp.is24Hours,
                  isClosed: dayOp.isClosed,
                }
              : { openCloseTimes: [{ open: '', close: '' }], is24Hours: false, isClosed: false };
          });

          setDayInfo(orderedOperatingHours);

          if (
            orderedOperatingHours[0].openCloseTimes.some((time) => time.open || time.close) ||
            orderedOperatingHours[0].is24Hours ||
            orderedOperatingHours[0].isClosed
          ) {
            setSelectedDay(0);
          }

          switch (catalogResponse.operatingHoursType) {
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
        })
        .catch((error) => {
          console.error('Erro ao buscar as informações do catálogo:', error);
          setMessage('Erro ao carregar as informações do catálogo.', 'error');
          router.push('/channel/catalog/my');
        });
    } else {
      router.push('/channel/catalog/my');
    }
  }, [routeCatalogId, searchParams, fullDaysOfWeek, setMessage, router]);

  useEffect(() => {
    const { name, nameBoss, cnpj, email, phone } = CatalogData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnpjRegex = /^\d{14}$/;
    const isNameValid = name !== '' && name.length <= 65;
    const isNameBossValid = nameBoss !== '' && nameBoss.length <= 65;
    const isEmailValid = email !== '' && emailRegex.test(email);
    const isCnpjValid = cnpj !== '' && cnpjRegex.test(cnpj.replace(/[^\d]/g, ''));
    const isPhoneValid = phone !== '';
    setIsFormValid(isNameValid && isNameBossValid && isEmailValid && isCnpjValid && isPhoneValid);
  }, [CatalogData]);

  const handleDayClick = (dayIndex) => {
    setSelectedDay(dayIndex === selectedDay ? null : dayIndex);
  };

  const handleInputChange = (dayIndex, timeIndex, name, value) => {
    const newDayInfo = [...dayInfo];
    newDayInfo[dayIndex].openCloseTimes[timeIndex][name] = value;
    setDayInfo(newDayInfo);
  };

  const handleToggle = (dayIndex, field) => {
    const newDayInfo = [...dayInfo];
    newDayInfo[dayIndex][field] = !newDayInfo[dayIndex][field];
    if (field === 'is24Hours' && newDayInfo[dayIndex][field]) {
      newDayInfo[dayIndex].isClosed = false;
      newDayInfo[dayIndex].openCloseTimes = [{ open: '', close: '' }];
    } else if (field === 'isClosed' && newDayInfo[dayIndex][field]) {
      newDayInfo[dayIndex].is24Hours = false;
      newDayInfo[dayIndex].openCloseTimes = [{ open: '', close: '' }];
    }
    setDayInfo(newDayInfo);
  };

  const addOpenCloseTime = (dayIndex) => {
    const newDayInfo = [...dayInfo];
    newDayInfo[dayIndex].openCloseTimes.push({ open: '', close: '' });
    setDayInfo(newDayInfo);
  };

  const removeOpenCloseTime = (dayIndex, timeIndex) => {
    const newDayInfo = [...dayInfo];
    newDayInfo[dayIndex].openCloseTimes.splice(timeIndex, 1);
    setDayInfo(newDayInfo);
  };

  const handleOptionChange = (option) => {
    setSelectedOption(option);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCatalogDTO((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = useCallback(() => {
    const { name, nameBoss, cnpj, email, phone, addressId } = CatalogData;
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
      const isAllDaysConfigured = dayInfo.every(
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
  }, [CatalogData, selectedOption, dayInfo, setMessage]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (validateForm()) {
        const operatingHours =
          selectedOption === 'normal'
            ? dayInfo.map((day, index) => ({
                dayOfWeek: fullDaysOfWeek[index],
                timeIntervals:
                  day.is24Hours || day.isClosed
                    ? []
                    : day.openCloseTimes.map((time) => ({
                        openTime: time.open,
                        closeTime: time.close,
                      })),
                is24Hours: day.is24Hours,
                isClosed: day.isClosed,
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
          ...CatalogData,
          operatingHoursType,
          operatingHours,
        };

        console.log('ID do endereço na edição:', catalogData.addressId);

        try {
          if (!catalogId) return;
          await editCatalog(catalogId, catalogData);
          setMessage('Catálogo editado com sucesso!', 'success');
          router.push('/channel/catalog/my');
        } catch (error) {
          let errorMessage = 'Erro ao editar o catálogo. Tente novamente.';
          if (error && typeof error === 'object' && error.response && error.response.data) {
            errorMessage = error.response.data.message || errorMessage;
          }
          setMessage(errorMessage, 'error');
          console.error('Erro ao editar o catálogo:', error);
        }
      }
    },
    [catalogId, CatalogData, selectedOption, dayInfo, fullDaysOfWeek, setMessage, router, validateForm]
  );

  const handleSelectAddress = () => {
    if (!catalogId) {
      setMessage('O ID do catálogo ainda não foi carregado. Tente novamente em instantes.', 'error');
      return;
    }
    const returnTo = `/channel/catalog/my/edit/${catalogId}`;
    router.push(`/profile/address?selectMode=1&returnTo=${encodeURIComponent(returnTo)}`);
  };

  return (
    <div className={styles.addCatalogPage}>
      <Head>
        <title>Editar Catálogo</title>
        <meta name="description" content="Edite um catálogo existente." />
      </Head>
      {isMobile && (
        <MobileHeader
          title="Editar Catálogo"
          buttons={{ close: true, delete: true }}
          handleBack={handleBack}
          onDelete={handleDelete}
        />
      )}
      <div className={styles.addCatalogContainer}>
        <SubHeader
          title="Editar Catálogo"
          handleBack={handleBack}
          showDeleteButton={true}
          handleDelete={handleDelete}
        />
        <form onSubmit={handleSubmit}>
          <Card title="Dados">
            <CustomInput
              title="Nome do catálogo"
              type="text"
              name="name"
              value={CatalogData.name}
              onChange={handleFormChange}
            />
            <CustomInput
              title="Nome empresarial"
              type="text"
              bottomLeftText="Final LTDA, MEI, LLM"
              name="nameBoss"
              value={CatalogData.nameBoss}
              onChange={handleFormChange}
            />
            <CustomInput
              title="CNPJ"
              type="text"
              name="cnpj"
              value={CatalogData.cnpj}
              onChange={handleFormChange}
            />
            <CustomInput
              title="E-mail"
              type="text"
              name="email"
              bottomLeftText="Certifique-se de que você tenha acesso a ele"
              value={CatalogData.email}
              onChange={handleFormChange}
            />
            <div className={styles.customInputContainerPhone}>
              <label className={styles.inputTitlePhone}>Telefone</label>
              <PhoneInput
                country={'br'}
                value={CatalogData.phone}
                onChange={(phone) =>
                  setCatalogDTO((prev) => ({ ...prev, phone }))
                }
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                }}
                inputClass={styles.phoneInput}
                buttonClass={styles.phoneInputButton}
                dropdownClass={styles.phoneInputDropdown}
                containerClass="phone-input-container"
              />
              <div className={styles.inputBottomText}>
                <span className={styles.bottomLeftPhone}>
                  Vamos te enviar informações por WhatsApp
                </span>
              </div>
            </div>
          </Card>
          <Card title="Endereço de origem">
            <SeeData
              title={CatalogData.addressStreet || 'Selecionar Endereço'}
              content={
                CatalogData.addressCep
                  ? `CEP: ${CatalogData.addressCep} - ${CatalogData.addressCity}/${CatalogData.addressState}`
                  : 'Nenhum endereço selecionado'
              }
              subContent={
                CatalogData.addressRecipientName
                  ? `${CatalogData.addressRecipientName} - ${CatalogData.addressRecipientPhone}`
                  : ''
              }
              stackContent={true}
              linkText="Selecionar"
              onClick={handleSelectAddress}
            />
          </Card>
          <Card title="Funcionamento">
            <div className={styles.selectionSeeDataWrapper}>
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
                  <label className={styles.daysSelectionLabel}>
                    Selecionar dias
                  </label>
                  <div className={styles.daysSelection}>
                    {daysOfWeek.map((day, index) => (
                      <div
                        key={index}
                        className={`${styles.dayBox} ${
                          selectedDay === index ? styles.selected : ''
                        }`}
                        onClick={() => handleDayClick(index)}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  {selectedDay !== null && (
                    <div key={selectedDay} className={styles.dayDetails}>
                      <h4>{fullDaysOfWeek[selectedDay]}</h4>
                      <div className={styles.hourSeeDataWrapper}>
                        <SeeData
                          title="Aberto 24 horas"
                          content="Aberto 24 horas"
                          stackContent={true}
                          showToggleButton={true}
                          toggled={dayInfo[selectedDay].is24Hours}
                          onToggle={() => handleToggle(selectedDay, 'is24Hours')}
                        />
                        <SeeData
                          title="Fechado"
                          content="Fechado"
                          stackContent={true}
                          showToggleButton={true}
                          toggled={dayInfo[selectedDay].isClosed}
                          onToggle={() => handleToggle(selectedDay, 'isClosed')}
                        />
                      </div>
                      {!dayInfo[selectedDay].is24Hours &&
                        !dayInfo[selectedDay].isClosed &&
                        Array.isArray(dayInfo[selectedDay].openCloseTimes) &&
                        dayInfo[selectedDay].openCloseTimes.map((time, timeIndex) => (
                          <div key={timeIndex} className={styles.openCloseSeeDataWrapper}>
                            <CustomSelect
                              title="Abre"
                              name={`open-${selectedDay}-${timeIndex}`}
                              value={time.open}
                              options={timeOptions}
                              onChange={(e) =>
                                handleInputChange(selectedDay, timeIndex, 'open', e.target.value)
                              }
                            />
                            <CustomSelect
                              title="Fecha"
                              name={`close-${selectedDay}-${timeIndex}`}
                              value={time.close}
                              options={timeOptions}
                              onChange={(e) =>
                                handleInputChange(selectedDay, timeIndex, 'close', e.target.value)
                              }
                            />
                            <Image
                              src={closeIcon}
                              alt="Remover"
                              className={styles.removeTimeButton}
                              onClick={() => removeOpenCloseTime(selectedDay, timeIndex)}
                            />
                          </div>
                        ))}
                      {!dayInfo[selectedDay].is24Hours &&
                        !dayInfo[selectedDay].isClosed && (
                          <button
                            type="button"
                            className={styles.addTimeButton}
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
                content="Não mostrar o horário de funcionamento"
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
          <div className={styles.confirmationButtonSpace}>
            <StageButton
              text="Salvar"
              backgroundColor={isFormValid ? '#7B33E5' : '#212121'}
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(EditCatalog);