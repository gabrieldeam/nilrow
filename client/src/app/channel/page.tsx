'use client';

import { memo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import styles from './Channel.module.css';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import HeaderButton from '@/components/UI/HeaderButton/HeaderButton';
import StepButton from '@/components/UI/StepButton/StepButton';
import Card from '@/components/UI/Card/Card';
import ConfirmationModal from '@/components/Modals/ConfirmationModal/ConfirmationModal';
import SeeData from '@/components/UI/SeeData/SeeData';
import { useNotification } from '@/hooks/useNotification';

import { getMyChannel, updateChannelImage, toggleChannelVisibility, isChannelActive } from '@/services/channel/channelService';

import { ChannelData } from '@/types/services/channel';

import ordersIcon from '../../../public/assets/orders.svg';
import notificationsIcon from '../../../public/assets/notifications.svg';
import editAboutIcon from '../../../public/assets/editAbout.svg';
import promoterIcon from '../../../public/assets/promoter.svg';
import catalogIcon from '../../../public/assets/catalog.svg';
import purchaseEventIcon from '../../../public/assets/purchaseEvent.svg';

import defaultImage from '../../../public/assets/user.png'; 

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

const MyChannel: React.FC = () => {
  const { setMessage } = useNotification();
  const router = useRouter();
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(defaultImage.src);
  const [buttonText, setButtonText] = useState<string>('Escolher arquivo');
  const [instructionText, setInstructionText] = useState<string>(
    'Altere sua foto ou tire uma nova para todos verem de quem é o canal.'
  );
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const data = await getMyChannel();
        setChannelData(data);

        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }

        const activeStatus = await isChannelActive(data.id);
        setIsActive(activeStatus);
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
      }
    };

    fetchChannelData();
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setButtonText('Mudar arquivo');
      setInstructionText(file.name);
    }
  };

  const handleImageUpload = async () => {
    if (imageFile && channelData) {
      try {
        await updateChannelImage(channelData.id, imageFile);
        setMessage('Imagem atualizada com sucesso!', 'success');
      } catch (error) {
        console.error('Erro ao atualizar imagem:', error);
        setMessage('Erro ao atualizar imagem.', 'error');
      }
    }
  };

  const handleToggleVisibilityClick = () => {
    setIsModalOpen(true);
  };

  const handleToggleVisibilityConfirm = async () => {
    if (channelData) {
      try {
        await toggleChannelVisibility(channelData.id);
        setMessage(`Canal ${isActive ? 'desativado' : 'ativado'} com sucesso!`, 'success');

        if (isActive) {
          router.push('/profile'); 
        } else {
          router.push(`/@${channelData.nickname}`);
        }
      } catch (error) {
        console.error(`Erro ao ${isActive ? 'desativar' : 'ativar'} o canal:`, error);
        setMessage(`Erro ao ${isActive ? 'desativar' : 'ativar'} o canal.`, 'error');
      } finally {
        setIsModalOpen(false);
      }
    }
  };

  const handleToggleVisibilityCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={styles.myChannelPage}>
      {isMobile && (
        <MobileHeader
          title="Meu Canal"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles.myChannelContainer}>
        <div className={styles.myChannelContent}>
          <div className={styles.myChannelHeader}>
            <div className={styles.myChannelInfo}>
              <h1 className={`${styles.myChannelTitle} roboto-medium`}>Meu canal</h1>
              <div className={styles.myChannelButtons}>
                <HeaderButton icon={ordersIcon} link="/orders" />
                <HeaderButton icon={notificationsIcon} link="/notifications" />
              </div>
            </div>
            <div
              className={`${styles.toggleVisibilityLink} ${styles.toggleVisibilityDesktopOnly}`}
            >
              <button
                className={styles.toggleVisibilityButton}
                onClick={handleToggleVisibilityClick}
              >
                {isActive ? 'Desativar canal' : 'Ativar canal'}
              </button>
            </div>
          </div>

          <div className={styles.myChannelSteps}>
            <div className={styles.myChannelStepCardWrapper}>
              <div className={styles.myChannelImageUpload}>
                {imagePreview && (
                  <Image
                    src={channelData?.imageUrl ? `${apiUrl}${channelData.imageUrl}` : defaultImage.src}
                    alt="Preview"
                    className={styles.myChannelImagePreview}
                    width={70}
                    height={70}
                  />
                )}
                <div className={styles.myChannelUploadSection}>
                  <p className={styles.myChannelUploadInstruction}>
                    {instructionText}
                  </p>
                  <div className={styles.myChannelButtonsWrapper}>
                    <label
                      htmlFor="channel-image"
                      className={styles.myChannelUploadButton}
                    >
                      {buttonText}
                    </label>
                    <input
                      type="file"
                      id="channel-image"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={handleImageUpload}
                      className={styles.myChannelUploadButton}
                    >
                      Upload
                    </button>
                  </div>
                </div>
              </div>

              <Card
                title="Dados do canal"
                rightLink={{
                  href: `/channel/edit/`,
                  text: 'Alterar',
                }}
              >
                <div className={styles.seeDataWrapper}>
                  <SeeData
                    title="Nome"
                    content={channelData?.name || 'Nome do canal'}
                  />
                  <SeeData
                    title="Bio"
                    content={channelData?.biography || 'Biografia do canal'}
                  />
                  <SeeData
                    title="Link"
                    content={channelData?.externalLink || 'Link do canal'}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>

        <div className={styles.myChannelAdditionalSteps}>
          <StepButton
            icon={editAboutIcon}
            title="Sobre"
            paragraph="Informações adicionais sobre o canal."
            onClick={() => router.push('/channel/about')}
          />
          <StepButton
            icon={promoterIcon}
            title="Divulgador"
            paragraph="Crie uma conta para divulgar produtos e ganhar comissão."
            onClick={() => router.push('/channel/depois-colocar')}
          />
          <StepButton
            icon={catalogIcon}
            title="Catálogo"
            paragraph="Crie um catálogo e começe a divulgar seus produtos ou serviços."
            onClick={() => router.push('/channel/catalog')}
          />
          <StepButton
            icon={purchaseEventIcon}
            title="Evento de compra"
            paragraph="Crie eventos de compras especiais para divulgar com seus amigos."
            onClick={() => router.push('/channel/depois-colocar')}
          />
        </div>

        <div
          className={`${styles.toggleVisibilityLink} ${styles.toggleVisibilityMobileOnly}`}
        >
          <button
            className={styles.toggleVisibilityButton}
            onClick={handleToggleVisibilityClick}
          >
            {isActive ? 'Desativar canal' : 'Ativar canal'}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onConfirm={handleToggleVisibilityConfirm}
        onCancel={handleToggleVisibilityCancel}
        message={`Você tem certeza que deseja ${
          isActive ? 'desativar' : 'ativar'
        } o canal?`}
      />
    </div>
  );
};

export default memo(MyChannel);
