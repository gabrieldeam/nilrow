import React, { useState, useContext, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import { NotificationContext } from '../../../context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import { getUserProfile, updateUserProfile, getUserNickname, updateUserNickname } from '../../../services/profileApi';
import './EditProfile.css';

const EditProfile = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        nickname: ''
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userProfile = await getUserProfile();
                const userNickname = await getUserNickname();
                setFormData({
                    email: userProfile.email,
                    phone: userProfile.phone,
                    nickname: userNickname.replace('@', '')
                });
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
    }, [formData]);

    const handlePhoneChange = useCallback((value) => {
        setFormData({ ...formData, phone: value });
    }, [formData]);

    useEffect(() => {
        const { email, phone, nickname } = formData;
        setIsFormValid(email !== '' && phone !== '' && nickname !== '');
    }, [formData]);

    const validateEmail = useCallback((email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }, []);

    const validatePhone = useCallback((phone) => {
        const regex = /^\+?\d{10,15}$/;
        return regex.test(phone);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!isFormValid) {
            setError('Por favor, preencha todos os campos.');
            setShowNotification(true);
            return;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor, insira um email válido.');
            setShowNotification(true);
            return;
        }

        if (!validatePhone(formData.phone)) {
            setError('Por favor, insira um telefone válido.');
            setShowNotification(true);
            return;
        }

        try {
            await updateUserProfile({
                email: formData.email,
                phone: formData.phone
            });
            await updateUserNickname(formData.nickname);
            setMessage('Dados atualizados com sucesso!');
            navigate('/profile');
        } catch (error) {
            console.error('Erro ao atualizar dados:', error);
            setError('Erro ao atualizar dados. Tente novamente.');
            setShowNotification(true);
        }
    }, [formData, isFormValid, validateEmail, validatePhone, setMessage, navigate]);

    return (
        <div className="edit-profile-page">
            <Helmet>
                <title>Editar Perfil - Nilrow</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Dados da sua conta" buttons={{ close: true }} />
            )}
            <div className="edit-profile-container">
                <form onSubmit={handleSubmit}>
                    <Card title="Alterar">
                        <CustomInput 
                            title="E-mail"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            bottomLeftText="Certifique-se de que você tenha acesso a ele"
                        />
                        <div className="custom-input-container-phone">
                            <label className="input-title-phone">Telefone</label>
                            <PhoneInput
                                country={'br'}
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                inputProps={{
                                    name: 'phone',
                                    required: true,
                                    autoFocus: true
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
                        <CustomInput 
                            title="Nome de usuário"
                            type="text"
                            name="nickname"
                            value={formData.nickname}
                            onChange={handleChange}
                            bottomLeftText="Este será seu identificador único na plataforma"
                        />
                    </Card>
                    <div onClick={handleSubmit} style={{ width: '100%' }} className="confirmationButton-space">
                        <StageButton
                            text="Salvar"
                            backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                            type="button"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(EditProfile);
