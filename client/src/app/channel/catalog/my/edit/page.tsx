'use client';

import React, {
  useCallback,
  useState,
  memo,
  useEffect,
  useMemo,
  ChangeEvent,
  FormEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Head from 'next/head';
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

import closeIcon from '../../../../../../public/assets/close.svg';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

import { CatalogDTO, OpenCloseTime, DayInfo } from '@/types/services/catalog';

import styles from './EditCatalog.module.css';

const EditCatalog: React.FC = () => {
  const { setMessage } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth <= 768 : false;
  const [catalogId, setCatalogId] = useState<string | null>(null);

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

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [DayInfo, setDayInfo] = useState<DayInfo[]>(
    fullDaysOfWeek.map(() => ({ openCloseTimes: [{ open: '', close: '' }], is24Hours: false, isClosed: false }))
  );

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [CatalogDTO, setCatalogDTO] = useState<CatalogDTO>({
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
    // Caso o back-end aceite esses campos, você pode incluir operatingHoursType e operatingHours na interface.
  });
  const [isFormValid, setIsFormValid] = useState<boolean>(false);

  useEffect(() => {
    const catalogIdFromQuery = searchParams.get('catalogId');
    const id = catalogIdFromQuery ? String(catalogIdFromQuery) : localStorage.getItem('selectedCatalogId');
    const selectedAddressId = searchParams.get('selectedAddressId')
      ? Number(searchParams.get('selectedAddressId'))
      : undefined;
    const selectedAddressStreet = searchParams.get('selectedAddressStreet')
      ? String(searchParams.get('selectedAddressStreet'))
      : undefined;
    const selectedAddressCep = searchParams.get('selectedAddressCep')
      ? String(searchParams.get('selectedAddressCep'))
      : undefined;
    const selectedAddressCity = searchParams.get('selectedAddressCity')
      ? String(searchParams.get('selectedAddressCity'))
      : undefined;
    const selectedAddressState = searchParams.get('selectedAddressState')
      ? String(searchParams.get('selectedAddressState'))
      : undefined;
    const selectedAddressRecipientName = searchParams.get('selectedAddressRecipientName')
      ? String(searchParams.get('selectedAddressRecipientName'))
      : undefined;
    const selectedAddressRecipientPhone = searchParams.get('selectedAddressRecipientPhone')
      ? String(searchParams.get('selectedAddressRecipientPhone'))
      : undefined;

    if (id) {
      setCatalogId(id);
      const isAddressSelected = selectedAddressId !== undefined;
      getCatalogByCatalogId(id)
        .then(async (catalog: any) => {
          setCatalogDTO((prev) => ({
            ...prev,
            name: catalog.name,
            nameBoss: catalog.nameBoss,
            cnpj: catalog.cnpj,
            email: catalog.email,
            phone: catalog.phone,
            addressId: isAddressSelected ? selectedAddressId : catalog.addressId,
            addressStreet: isAddressSelected ? (selectedAddressStreet || '') : prev.addressStreet,
            addressCep: isAddressSelected ? (selectedAddressCep || '') : prev.addressCep,
            addressCity: isAddressSelected ? (selectedAddressCity || '') : prev.addressCity,
            addressState: isAddressSelected ? (selectedAddressState || '') : prev.addressState,
            addressRecipientName: isAddressSelected ? (selectedAddressRecipientName || '') : prev.addressRecipientName,
            addressRecipientPhone: isAddressSelected ? (selectedAddressRecipientPhone || '') : prev.addressRecipientPhone,
          }));

          if (!isAddressSelected && catalog.addressId) {
            try {
              const address = await getAddressById(catalog.addressId);
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
            const dayOp = catalog.operatingHours.find((oh: any) => oh.dayOfWeek === day);
            return dayOp
              ? {
                  openCloseTimes:
                    dayOp.OpenCloseTimes.length > 0
                      ? dayOp.OpenCloseTimes.map((time: any) => ({
                          open: time.openTime,
                          close: time.closeTime,
                        }))
                      : [{ open: '', close: '' }],
                  is24Hours: dayOp.is24Hours,
                  isClosed: dayOp.closed,
                }
              : { openCloseTimes: [{ open: '', close: '' }], is24Hours: false, isClosed: false };
          });

          setDayInfo(orderedOperatingHours);

          // Se o primeiro dia tiver algum horário configurado, seleciona-o inicialmente.
          if (
            orderedOperatingHours[0].openCloseTimes.some((time: OpenCloseTime) => time.open || time.close) ||
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
        })
        .catch((error) => {
          console.error('Erro ao buscar as informações do catálogo:', error);
          setMessage('Erro ao carregar as informações do catálogo.', 'error');
          router.push('/channel/catalog/my');
        });
    } else {
      router.push('/channel/catalog/my');
    }
  }, [searchParams, fullDaysOfWeek, setMessage, router]);

  useEffect(() => {
    const { name, nameBoss, cnpj, email, phone } = CatalogDTO;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnpjRegex = /^\d{14}$/;
    const isNameValid = name !== '' && name.length <= 65;
    const isNameBossValid = nameBoss !== '' && nameBoss.length <= 65;
    const isEmailValid = email !== '' && emailRegex.test(email);
    const isCnpjValid = cnpj !== '' && cnpjRegex.test(cnpj.replace(/[^\d]/g, ''));
    const isPhoneValid = phone !== '';
    setIsFormValid(isNameValid && isNameBossValid && isEmailValid && isCnpjValid && isPhoneValid);
  }, [CatalogDTO]);

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex === selectedDay ? null : dayIndex);
  };

  const handleInputChange = (
    dayIndex: number,
    timeIndex: number,
    name: keyof OpenCloseTime,
    value: string
  ) => {
    const newDayInfo = [...DayInfo];
    newDayInfo[dayIndex].openCloseTimes[timeIndex][name] = value;
    setDayInfo(newDayInfo);
  };

  const handleToggle = (dayIndex: number, field: 'is24Hours' | 'isClosed') => {
    const newDayInfo = [...DayInfo];
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

  const addOpenCloseTime = (dayIndex: number) => {
    const newDayInfo = [...DayInfo];
    newDayInfo[dayIndex].openCloseTimes.push({ open: '', close: '' });
    setDayInfo(newDayInfo);
  };

  const removeOpenCloseTime = (dayIndex: number, timeIndex: number) => {
    const newDayInfo = [...DayInfo];
    newDayInfo[dayIndex].openCloseTimes.splice(timeIndex, 1);
    setDayInfo(newDayInfo);
  };

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCatalogDTO((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = useCallback((): boolean => {
    const { name, nameBoss, cnpj, email, phone, addressId } = CatalogDTO;
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
      const isAllDaysConfigured = DayInfo.every(
        (day) => day.is24Hours || day.isClosed || day.openCloseTimes.every((time) => time.open && time.close)
      );

      if (!isAllDaysConfigured) {
        setMessage('Você deve configurar todos os dias quando escolher "Aberto com horário normal".', 'error');
        return false;
      }
    }

    return true;
  }, [CatalogDTO, selectedOption, DayInfo, setMessage]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validateForm()) {
        const operatingHours =
          selectedOption === 'normal'
            ? DayInfo.map((day, index) => ({
                dayOfWeek: fullDaysOfWeek[index],
                OpenCloseTimes:
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
          ...CatalogDTO,
          operatingHoursType,
          operatingHours,
        };

        try {
          if (!catalogId) return;
          await editCatalog(catalogId, catalogData);
          setMessage('Catálogo editado com sucesso!', 'success');
          router.push('/channel/catalog/my');
        } catch (error: any) {
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
    [catalogId, CatalogDTO, selectedOption, DayInfo, fullDaysOfWeek, setMessage, router, validateForm]
  );

  // Removemos o parâmetro de evento para adequar à tipagem esperada pelo SeeData.
  const handleSelectAddress = () => {
    const CatalogDTOWithTimestamp = {
      data: CatalogDTO,
      timestamp: new Date().getTime(),
    };
    localStorage.setItem('editCatalogCatalogDTO', JSON.stringify(CatalogDTOWithTimestamp));
    const returnTo = `/channel/catalog/my/edit/${catalogId}`;
    router.push(`/profile/address?selectMode=true&returnTo=${encodeURIComponent(returnTo)}`);
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
              value={CatalogDTO.name}
              onChange={handleFormChange}
            />
            <CustomInput
              title="Nome empresarial"
              type="text"
              bottomLeftText="Final LTDA, MEI, LLM"
              name="nameBoss"
              value={CatalogDTO.nameBoss}
              onChange={handleFormChange}
            />
            <CustomInput title="CNPJ" type="text" name="cnpj" value={CatalogDTO.cnpj} onChange={handleFormChange} />
            <CustomInput
              title="E-mail"
              type="text"
              name="email"
              bottomLeftText="Certifique-se de que você tenha acesso a ele"
              value={CatalogDTO.email}
              onChange={handleFormChange}
            />
            <div className={styles.customInputContainerPhone}>
              <label className={styles.inputTitlePhone}>Telefone</label>
              <PhoneInput
                country={'br'}
                value={CatalogDTO.phone}
                onChange={(phone) => setCatalogDTO((prev) => ({ ...prev, phone }))}
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
                <span className={styles.bottomLeftPhone}>Vamos te enviar informações por WhatsApp</span>
              </div>
            </div>
          </Card>
          <Card title="Endereço de origem">
            <SeeData
              title={CatalogDTO.addressStreet || 'Selecionar Endereço'}
              content={
                CatalogDTO.addressCep
                  ? `CEP: ${CatalogDTO.addressCep} - ${CatalogDTO.addressCity}/${CatalogDTO.addressState}`
                  : 'Nenhum endereço selecionado'
              }
              subContent={
                CatalogDTO.addressRecipientName
                  ? `${CatalogDTO.addressRecipientName} - ${CatalogDTO.addressRecipientPhone}`
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
                  <label className={styles.daysSelectionLabel}>Selecionar dias</label>
                  <div className={styles.daysSelection}>
                    {daysOfWeek.map((day, index) => (
                      <div
                        key={index}
                        className={`${styles.dayBox} ${selectedDay === index ? styles.selected : ''}`}
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
                          toggled={DayInfo[selectedDay].is24Hours}
                          onToggle={() => handleToggle(selectedDay, 'is24Hours')}
                        />
                        <SeeData
                          title="Fechado"
                          content="Fechado"
                          stackContent={true}
                          showToggleButton={true}
                          toggled={DayInfo[selectedDay].isClosed}
                          onToggle={() => handleToggle(selectedDay, 'isClosed')}
                        />
                      </div>
                      {!DayInfo[selectedDay].is24Hours &&
                        !DayInfo[selectedDay].isClosed &&
                        Array.isArray(DayInfo[selectedDay].openCloseTimes) &&
                        DayInfo[selectedDay].openCloseTimes.map((time, timeIndex) => (
                          <div key={timeIndex} className={styles.openCloseSeeDataWrapper}>
                            <CustomSelect
                              title="Abre"
                              name={`open-${selectedDay}-${timeIndex}`}
                              value={time.open}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                handleInputChange(selectedDay, timeIndex, 'open', e.target.value)
                              }
                            />
                            <CustomSelect
                              title="Fecha"
                              name={`close-${selectedDay}-${timeIndex}`}
                              value={time.close}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                                handleInputChange(selectedDay, timeIndex, 'close', e.target.value)
                              }
                            />
                            <img
                              src={closeIcon}
                              alt="Remover"
                              className={styles.removeTimeButton}
                              onClick={() => removeOpenCloseTime(selectedDay, timeIndex)}
                            />
                          </div>
                        ))}
                      {!DayInfo[selectedDay].is24Hours &&
                        !DayInfo[selectedDay].isClosed && (
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
          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Salvar" backgroundColor={isFormValid ? '#7B33E5' : '#212121'} type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(EditCatalog);
