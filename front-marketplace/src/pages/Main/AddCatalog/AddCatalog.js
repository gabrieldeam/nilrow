import React, { useCallback, useState, memo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import SeeData from '../../../components/UI/SeeData/SeeData';
import { Helmet } from 'react-helmet-async';
import './AddCatalog.css';
import { NotificationContext } from '../../../context/NotificationContext';
import closeIcon from '../../../assets/close.svg'; // Certifique-se de que o caminho para a imagem está correto

const AddCatalog = () => {
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const daysOfWeek = ['S', 'T', 'Q', 'Q', 'Q', 'S', 'S'];
    const fullDaysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

    const [selectedDay, setSelectedDay] = useState(null);
    const [dayData, setDayData] = useState(
        Array(7).fill({ openCloseTimes: [{ open: '', close: '' }], is24Hours: false, isClosed: false })
    );

    const [selectedOption, setSelectedOption] = useState('');

    const handleDayClick = (dayIndex) => {
        if (selectedDay === dayIndex) {
            setSelectedDay(null);
        } else {
            setSelectedDay(dayIndex);
        }
    };

    const handleInputChange = (dayIndex, timeIndex, name, value) => {
        const newDayData = [...dayData];
        newDayData[dayIndex].openCloseTimes[timeIndex][name] = value;
        setDayData(newDayData);
    };

    const handleToggle = (dayIndex, field) => {
        const newDayData = [...dayData];
        newDayData[dayIndex][field] = !newDayData[dayIndex][field];
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

    return (
        <div className="add-catalog-page">
            <Helmet>
                <title>Adicionar Catálogo</title>
                <meta name="description" content="Adicione um novo." />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Adicionar Catálogo" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="add-catalog-container">
                <SubHeader title="Adicionar Catálogo" handleBack={handleBack} />
                <form onSubmit={(e) => e.preventDefault()}>
                    <Card title="Dados">
                        <CustomInput title="Nome do catálogo" type="text" name="name" value="" onChange={() => {}} />
                        <CustomInput title="Nome empresarial" type="text" name="nameBoss" value="" onChange={() => {}} />
                        <CustomInput title="CNPJ" type="text" name="cnpj" value="" onChange={() => {}} />
                        <CustomInput title="E-mail" type="text" name="email" value="" onChange={() => {}} />
                        <CustomInput title="Telefone" type="text" name="phone" value="" onChange={() => {}} />
                    </Card>
                    <Card title="Endereço de origem">
                        <SeeData title="Rua Numero" content="CEP - Cidade, Estado" subContent="recipientName + recipientPhone" stackContent={true} linkText="Editar" link={`/edit-catalog/`} />
                    </Card>
                    <Card title="Funcionamento">
                        <div className="selection-see-data-wrapper">
                            <SeeData
                                title="Aberto com horário normal"
                                content="Mostrar quando sua empresa está aberta"
                                stackContent={true}
                                showToggleButton={true}
                                isActive={selectedOption === 'normal'}
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
                                                isActive={dayData[selectedDay].is24Hours}
                                                onToggle={() => handleToggle(selectedDay, 'is24Hours')}
                                            />
                                            <SeeData
                                                content="Fechado"
                                                stackContent={true}
                                                showToggleButton={true}
                                                isActive={dayData[selectedDay].isClosed}
                                                onToggle={() => handleToggle(selectedDay, 'isClosed')}
                                            />
                                        </div>
                                        {dayData[selectedDay].openCloseTimes.map((time, timeIndex) => (
                                            <div key={timeIndex} className="open-close-see-data-wrapper">
                                                <CustomInput
                                                    title="Abre"
                                                    type="text"
                                                    name={`open-${selectedDay}-${timeIndex}`}
                                                    value={time.open}
                                                    onChange={(e) => handleInputChange(selectedDay, timeIndex, 'open', e.target.value)}
                                                />
                                                <CustomInput
                                                    title="Fecha"
                                                    type="text"
                                                    name={`close-${selectedDay}-${timeIndex}`}
                                                    value={time.close}
                                                    onChange={(e) => handleInputChange(selectedDay, timeIndex, 'close', e.target.value)}
                                                />
                                                <img
                                                    src={closeIcon}
                                                    alt="Remover"
                                                    className="remove-time-button"
                                                    onClick={() => removeOpenCloseTime(selectedDay, timeIndex)}
                                                />
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            className="add-time-button"
                                            onClick={() => addOpenCloseTime(selectedDay)}
                                        >
                                            + Adicionar horário
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                            <SeeData
                                title="Aberto sem horário normal"
                                content="Não mostrar o horário de funcionemento"
                                stackContent={true}
                                showToggleButton={true}
                                isActive={selectedOption === 'noHours'}
                                onToggle={() => handleOptionChange('noHours')}
                            />
                            <SeeData
                                title="Temporariamente fechado"
                                content="Mostrar que sua empresa será reaberta no futuro"
                                stackContent={true}
                                showToggleButton={true}
                                isActive={selectedOption === 'temporaryClosed'}
                                onToggle={() => handleOptionChange('temporaryClosed')}
                            />
                            <SeeData
                                title="Permanentemente fechado"
                                content="Mostrar que sua empresa não existe mais"
                                stackContent={true}
                                showToggleButton={true}
                                isActive={selectedOption === 'permanentClosed'}
                                onToggle={() => handleOptionChange('permanentClosed')}
                            />
                        </div>                
                    </Card>
                    <div className="confirmationButton-space">
                        <StageButton text="Salvar" backgroundColor={"#7B33E5"} type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(AddCatalog);
