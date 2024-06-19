import React, { memo, useCallback, useState, useEffect, useContext } from 'react';
import './AddChannel.css';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Main/SubHeader/SubHeader';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import { NotificationContext } from '../../../context/NotificationContext';
import { getUserNickname } from '../../../services/profileApi';
import { addChannel, uploadChannelImage, getMyChannel } from '../../../services/channelApi';
import defaultImage from '../../../assets/user.png';

const AddChannel = () => {
    const isMobile = window.innerWidth <= 768;
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '' });
    const [nickname, setNickname] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(defaultImage);
    const { setMessage } = useContext(NotificationContext);

    useEffect(() => {
        const fetchUserNickname = async () => {
            try {
                const userNickname = await getUserNickname();
                setNickname(userNickname);
            } catch (error) {
                console.error('Erro ao buscar nickname do usuário:', error);
            }
        };

        fetchUserNickname();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Envia apenas o campo name ao criar o canal
            await addChannel({ name: formData.name });
            const channelData = await getMyChannel();
            const fileToUpload = imageFile || defaultImage;
            await uploadChannelImage(channelData.id, fileToUpload);
            setMessage('Canal criado com sucesso!', 'success');
            navigate('/channel');
        } catch (error) {
            console.error('Erro ao criar canal:', error);
            setMessage('Erro ao criar canal.', 'error');
        }
    };

    const isFormValid = formData.name.trim() !== '';

    return (
        <div className="add-channel-page">
            <Helmet>
                <title>Criar canal</title>
                <meta name="description" content="Crie seu canal de divulgação" />
            </Helmet>
            {isMobile && (
                <MobileHeader title="Criar canal" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className="add-channel-container">
                <SubHeader title="Criar canal" handleBack={handleBack} />
                <form onSubmit={handleSubmit}>
                    <div className="add-channel-image-upload">
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" className="add-channel-image-preview" />
                        )}
                        <div className="add-channel-upload-section">
                            {!imageFile && (
                                <div className="upload-instruction">
                                    Escolha a imagem de apresentação do seu canal para todo mundo
                                </div>
                            )}
                            <label htmlFor="channel-image" className="add-channel-upload-button">
                                Escolher arquivo
                            </label>
                            <input
                                type="file"
                                id="channel-image"
                                name="image"
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                            {imageFile && (
                                <div className="file-name">
                                    {imageFile.name}
                                </div>
                            )}
                        </div>
                    </div>
                    <Card title="Seu canal">
                        <CustomInput
                            title="Nome do canal"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                        <CustomInput
                            title="Nome de usuário"
                            type="text"
                            name="nickname"
                            value={`@${nickname}`}
                            readOnly
                        />
                    </Card>
                    <div className="confirmationButton-space">
                        <StageButton
                            text="Adicionar Canal"
                            backgroundColor={isFormValid ? "#7B33E5" : "#212121"}
                            type="submit"
                            disabled={!isFormValid}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default memo(AddChannel);
