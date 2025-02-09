'use client';

import { memo, useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import styles from './Channel.module.css';

// Componentes de UI e hooks de notificação
import MobileHeader from '../../components/Layout/MobileHeader/MobileHeader';
import HeaderButton from '../../components/UI/HeaderButton/HeaderButton';
import StepButton from '../../components/UI/StepButton/StepButton';
import Card from '../../components/UI/Card/Card';
import ConfirmationModal from '../../components/Modals/ConfirmationModal/ConfirmationModal';
import SeeData from '../../components/UI/SeeData/SeeData';
import { useNotification } from '../../hooks/useNotification';

// Serviços da API
import { getMyChannel, updateChannelImage, toggleChannelVisibility, isChannelActive } from '@/services/channel/channelService';

// Interface do canal
import { ChannelData } from '../../types/pages/Channel';

// Ícones e imagens
import ordersIcon from '../../../public/assets/orders.svg';
import notificationsIcon from '../../../public/assets/notifications.svg';
import editAboutIcon from '../../../public/assets/editAbout.svg';
import promoterIcon from '../../../public/assets/promoter.svg';
import catalogIcon from '../../../public/assets/catalog.svg';
import purchaseEventIcon from '../../../public/assets/purchaseEvent.svg';

import defaultImage from '../../../public/assets/user.png'; 

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

  // Verificação de tela mobile no client side
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Buscar dados do canal ao montar
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

  // Fazer upload da imagem
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
      <Head>
        <title>Meu Canal</title>
        <meta name="description" content="Veja seu perfil na Nilrow." />
      </Head>

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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={styles.myChannelImagePreview}
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
                  href: `/edit-channel/${channelData?.id}`,
                  text: 'Alterar',
                }}
              >
                <div className="see-data-wrapper">
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
            onClick={() => router.push('/about-channel')}
          />
          <StepButton
            icon={promoterIcon}
            title="Divulgador"
            paragraph="Crie uma conta para divulgar produtos e ganhar comissão."
            onClick={() => router.push('/depois-colocar')}
          />
          <StepButton
            icon={catalogIcon}
            title="Catálogo"
            paragraph="Crie um catálogo e começe a divulgar seus produtos ou serviços."
            onClick={() => router.push('/catalog')}
          />
          <StepButton
            icon={purchaseEventIcon}
            title="Evento de compra"
            paragraph="Crie eventos de compras especiais para divulgar com seus amigos."
            onClick={() => router.push('/depois-colocar')}
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
