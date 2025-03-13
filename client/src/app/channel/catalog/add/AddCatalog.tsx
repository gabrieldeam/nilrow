'use client';

import React, {
  useCallback,
  useState,
  memo,
  useEffect,
  useMemo,
  ChangeEvent,
} from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { createCatalog } from '@/services/catalogService';

import closeIcon from '../../../../../public/assets/close.svg';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import styles from './AddCatalog.module.css';
import { CatalogDTO, OpenCloseTime, DayInfo } from '@/types/services/catalog';

type OperatingOption =
  | 'normal'
  | 'noHours'
  | 'temporaryClosed'
  | 'permanentClosed'
  | '';

interface OperatingHour {
  dayOfWeek: string;
  timeIntervals: { openTime: string; closeTime: string }[];
  is24Hours: boolean;
  closed: boolean;
}

const AddCatalog: React.FC = () => {
  const { setMessage } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile =
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false;

  const handleBack = useCallback(() => {
    router.push('/catalog');
  }, [router]);

  const daysOfWeek = useMemo(() => ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'], []);
  const fullDaysOfWeek = useMemo(
    () => ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    []
  );

  const timeOptions = Array.from({ length: 24 * 2 }, (_, index) => {
    const totalMinutes = index * 30;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedHour = hours.toString().padStart(2, '0') + ':' + minutes.toString().padStart(2, '0');
    return { label: formattedHour, value: formattedHour };
  });

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayData, setDayData] = useState<DayInfo[]>(
    fullDaysOfWeek.map(() => ({
      openCloseTimes: [{ open: '', close: '' }],
      is24Hours: false,
      isClosed: false,
    }))
  );

  const [selectedOption, setSelectedOption] = useState<OperatingOption>('');
  const [formData, setFormData] = useState<CatalogDTO>({    
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('addCatalogFormData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        const currentTime = new Date().getTime();
        const tenMinutes = 2 * 60 * 1000;
        if (currentTime - parsedData.timestamp < tenMinutes) {
          setFormData(parsedData.data);
        } else {
          localStorage.removeItem('addCatalogFormData');
        }
      }
    }

    const selectedAddressId = searchParams.get('selectedAddressId');
    const selectedAddressStreet = searchParams.get('selectedAddressStreet');
    const selectedAddressCep = searchParams.get('selectedAddressCep');
    const selectedAddressCity = searchParams.get('selectedAddressCity');
    const selectedAddressState = searchParams.get('selectedAddressState');
    const selectedAddressRecipientName = searchParams.get('selectedAddressRecipientName');
    const selectedAddressRecipientPhone = searchParams.get('selectedAddressRecipientPhone');

    if (selectedAddressId) {
      setFormData((prevFormData) => ({
        ...prevFormData,
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

  const handleDayClick = (dayIndex: number) => {
    setSelectedDay(dayIndex === selectedDay ? null : dayIndex);
  };

  const handleInputChange = (
    dayIndex: number,
    timeIndex: number,
    name: keyof OpenCloseTime,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { value } = event.target;
    const newDayData = [...dayData];
    newDayData[dayIndex].openCloseTimes[timeIndex][name] = value;
    setDayData(newDayData);
  };

  const handleToggle = (dayIndex: number, field: 'is24Hours' | 'isClosed') => {
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

  const addOpenCloseTime = (dayIndex: number) => {
    const newDayData = [...dayData];
    newDayData[dayIndex].openCloseTimes.push({ open: '', close: '' });
    setDayData(newDayData);
  };

  const removeOpenCloseTime = (dayIndex: number, timeIndex: number) => {
    const newDayData = [...dayData];
    newDayData[dayIndex].openCloseTimes.splice(timeIndex, 1);
    setDayData(newDayData);
  };

  const handleOptionChange = (option: OperatingOption) => {
    setSelectedOption(option);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = useCallback((): boolean => {
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
      const isAllDaysConfigured = dayData.every(day =>
        day.is24Hours ||
        day.isClosed ||
        day.openCloseTimes.every(time => time.open && time.close)
      );

      if (!isAllDaysConfigured) {
        setMessage(
          'Você deve configurar todos os dias quando escolher "Aberto com horário normal".',
          'error'
        );
        return false;
      }
    }

    return true;
  }, [formData, selectedOption, dayData, setMessage]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validateForm()) {
        const operatingHours: OperatingHour[] =
          selectedOption === 'normal'
            ? dayData.map((day, index) => ({
                dayOfWeek: fullDaysOfWeek[index],
                is24Hours: day.is24Hours,
                closed: day.isClosed, // aqui mapeamos 'closed' conforme o esperado
                timeIntervals:
                  day.is24Hours || day.isClosed
                    ? [] // se for 24h ou fechado, não precisa de intervalos
                    : day.openCloseTimes.map((time) => ({
                        openTime: time.open,
                        closeTime: time.close,
                      })),
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

        const catalogData: CatalogDTO & {
          operatingHoursType: string;
          operatingHours: OperatingHour[];
        } = {
          ...formData,
          operatingHoursType,
          operatingHours,
        };

        try {
          await createCatalog(catalogData);
          setMessage('Catálogo criado com sucesso!', 'success');
          router.push('/channel/catalog');
        } catch (error: unknown) {
          const err = error as { response?: { data?: { message?: string } } };
          if (err.response && err.response.data) {
            const errorMessage =
              err.response.data.message ||
              'Erro ao criar o catálogo. Tente novamente.';
            setMessage(errorMessage, 'error');
          } else {
            setMessage('Erro ao criar o catálogo. Tente novamente.', 'error');
          }
          console.error('Erro ao criar o catálogo:', error);
        }
      }
    },
    [formData, selectedOption, dayData, fullDaysOfWeek, setMessage, router, validateForm]
  );

  const handleSelectAddress = () => {
    const formDataWithTimestamp = {
      data: formData,
      timestamp: new Date().getTime(),
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('addCatalogFormData', JSON.stringify(formDataWithTimestamp));
    }
    router.push('/profile/address?selectMode=1&returnTo=/channel/catalog/add');
  };

  return (
    <div className={styles.addCatalogPage}>
      <Head>
        <title>Adicionar Catálogo</title>
        <meta name="description" content="Adicione um novo catálogo." />
      </Head>
      {isMobile && (
        <MobileHeader
          title="Adicionar Catálogo"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}
      <div className={styles.addCatalogContainer}>
        <SubHeader title="Adicionar Catálogo" handleBack={handleBack} />
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
            <div className={styles.customInputContainerPhone}>
              <label className={styles.inputTitlePhone}>Telefone</label>
              <PhoneInput
                country={'br'}
                value={formData.phone}
                onChange={(phone: string) => setFormData({ ...formData, phone })}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                }}
                inputClass={styles.phoneInput}
                buttonClass={styles.phoneInputButton}
                dropdownClass={styles.phoneInputDropdown}
                containerClass={styles.phoneInputContainer}
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
              title="Endereço"
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
              linkText="Selecionar"
              onClick={handleSelectAddress}
              buttonType="button"
              stackContent={true}
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
                          title="Aberto 24h"
                          content="Aberto 24 horas"
                          stackContent={true}
                          showToggleButton={true}
                          toggled={dayData[selectedDay].is24Hours}
                          onToggle={() => handleToggle(selectedDay, 'is24Hours')}
                        />
                        <SeeData
                          title="Fechado"
                          content="Fechado"
                          stackContent={true}
                          showToggleButton={true}
                          toggled={dayData[selectedDay].isClosed}
                          onToggle={() => handleToggle(selectedDay, 'isClosed')}
                        />
                      </div>
                      {!dayData[selectedDay].is24Hours &&
                        !dayData[selectedDay].isClosed &&
                        dayData[selectedDay].openCloseTimes.map((time, timeIndex) => (
                          <div key={timeIndex} className={styles.openCloseSeeDataWrapper}>
                            <CustomSelect
                              title="Abre"
                              name={`open-${selectedDay}-${timeIndex}`}
                              value={time.open}
                              onChange={(e) =>
                                handleInputChange(selectedDay, timeIndex, 'open', e)
                              }
                              options={timeOptions}
                            />
                            <CustomSelect
                              title="Fecha"
                              name={`close-${selectedDay}-${timeIndex}`}
                              value={time.close}
                              onChange={(e) =>
                                handleInputChange(selectedDay, timeIndex, 'close', e)
                              }
                              options={timeOptions}
                            />
                            <div
                              className={styles.removeTimeButton}
                              onClick={() => removeOpenCloseTime(selectedDay, timeIndex)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Image src={closeIcon} alt="Remover" />
                            </div>
                          </div>
                        ))}
                      {!dayData[selectedDay].is24Hours &&
                        !dayData[selectedDay].isClosed && (
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

export default memo(AddCatalog);
