'use client';

import { memo, useCallback, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import PrivacyNotice from '@/components/UI/PrivacyNotice/PrivacyNotice';
import { useNotification } from '@/hooks/useNotification';
import { getUserNickname } from '@/services/profileService';
import { addChannel, uploadChannelImage, getMyChannel } from '@/services/channel/channelService';
import defaultImage from '@/../public/assets/user.png';
import styles from './AddChannel.module.css';

const AddChannel = () => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '' });
    const [nickname, setNickname] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>(defaultImage.src);
 const { setMessage } = useNotification();

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await addChannel({ name: formData.name });
            const channelData = await getMyChannel();
            if (imageFile) {
                await uploadChannelImage(channelData.id, imageFile);
            }
            setMessage('Canal criado com sucesso!', 'success');
            router.push(`/@${nickname}`);
        } catch (error) {
            console.error('Erro ao criar canal:', error);
            setMessage('Erro ao criar canal.', 'error');
        }
    };

    const isFormValid = formData.name.trim() !== '';

    return (
        <div className={styles.addChannelPage}>
            {isMobile && (
                <MobileHeader title="Criar canal" buttons={{ close: true }} handleBack={handleBack} />
            )}
            <div className={styles.addChannelContainer}>
                <SubHeader title="Criar canal" handleBack={handleBack} />
                <form onSubmit={handleSubmit}>
                    <div className={styles.addChannelImageUpload}>
                        {imagePreview && (
                            <Image src={imagePreview} alt="Preview" width={70} height={70} className={styles.addChannelImagePreview} />
                        )}
                        <div className={styles.addChannelUploadSection}>
                            {!imageFile && (
                                <div className={styles.uploadInstruction}>
                                    Escolha a imagem de apresentação do seu canal para todo mundo
                                </div>
                            )}
                            <label htmlFor="channel-image" className={styles.addChannelUploadButton}>
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
                            {imageFile && <div className={styles.fileName}>{imageFile.name}</div>}
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
                            onChange={() => {}}
                        />
                    </Card>
                    <PrivacyNotice />
                    <div className={styles.confirmationButtonSpace}>
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
