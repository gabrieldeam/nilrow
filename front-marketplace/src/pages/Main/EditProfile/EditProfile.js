import React, { useState, useContext, useCallback, memo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import { NotificationContext } from '../../../context/NotificationContext';
import { Helmet } from 'react-helmet-async';
import { getUserProfile, updateUserProfile, getUserNickname, updateUserNickname } from '../../../services/profileApi';
import './EditProfile.css';

const validateNickname = (nickname) => {
    const regex = /^[a-z][a-z0-9._]{2,28}[a-z0-9]$/;
    const hasNoConsecutiveSpecialChars = !/([._])\1/.test(nickname);
    return regex.test(nickname) && hasNoConsecutiveSpecialChars;
};

const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

const validatePhone = (phone) => {
    const regex = /^\+?\d{10,15}$/;
    return regex.test(phone);
};

const EditProfile = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        nickname: ''
    });
    const [originalData, setOriginalData] = useState({
        email: '',
        phone: '',
        nickname: ''
    });
    const [isFormValid, setIsFormValid] = useState(false);
    const [nicknameValid, setNicknameValid] = useState(null);
    const [error, setError] = useState('');
    const [showNotification, setShowNotification] = useState(false);
    const { setMessage } = useContext(NotificationContext);
    const navigate = useNavigate();
    const isMobile = window.innerWidth <= 768;

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userProfile = await getUserProfile();
                const userNickname = await getUserNickname();
                const nickname = userNickname.replace('@', '');
                setFormData({
                    email: userProfile.email,
                    phone: userProfile.phone,
                    nickname: nickname
                });
                setOriginalData({
                    email: userProfile.email,
                    phone: userProfile.phone,
                    nickname: nickname
                });
                setNicknameValid(validateNickname(nickname));
            } catch (error) {
                console.error('Erro ao buscar dados do usuário:', error);
            }
        };
        fetchUserData();
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === 'email' ? value.toLowerCase() : value });
        if (name === 'nickname') {
            setNicknameValid(validateNickname(value.toLowerCase()));
        }
    }, [formData]);

    const handlePhoneChange = useCallback((value) => {
        setFormData({ ...formData, phone: value });
    }, [formData]);

    useEffect(() => {
        const { email, phone, nickname } = formData;
        setIsFormValid(email !== '' && phone !== '' && nickname !== '' && nicknameValid);
    }, [formData, nicknameValid]);

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

        if (!nicknameValid) {
            setError('Por favor, insira um nome de usuário válido.');
            setShowNotification(true);
            return;
        }

        const updatedProfileData = {
            email: formData.email !== originalData.email ? formData.email : null,
            phone: formData.phone !== originalData.phone ? formData.phone : null
        };

        const updatedNickname = formData.nickname !== originalData.nickname ? formData.nickname : null;

        try {
            await updateUserProfile(updatedProfileData);
            await updateUserNickname(updatedNickname);
            setMessage('Dados atualizados com sucesso!');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erro ao atualizar dados. Tente novamente.';
            console.error('Erro ao atualizar dados:', errorMessage);
            setError(errorMessage);
            setShowNotification(true);
        }
    }, [isFormValid, formData, nicknameValid, originalData, setMessage]);

    return (
        <div className="edit-profile-page">
            <Helmet>
                <title>Editar Perfil - Nilrow</title>
                <meta name="description" content="Edite seu perfil na Nilrow." />
            </Helmet>
            {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}
            {isMobile && (
                <MobileHeader title="Editar dados" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="edit-profile-container">
                <SubHeader title="Editar dados" handleBack={handleBack} />
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
                            isValid={nicknameValid}
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
