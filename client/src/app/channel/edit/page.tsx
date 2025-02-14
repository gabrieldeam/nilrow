'use client';


import { useState, useEffect, useCallback, useContext, memo } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

import CustomInput from '../../../components/UI/CustomInput/CustomInput';
import Card from '../../../components/UI/Card/Card';
import StageButton from '../../../components/UI/StageButton/StageButton';
import Notification from '../../../components/UI/Notification/Notification';
import MobileHeader from '../../../components/Layout/MobileHeader/MobileHeader';
import SubHeader from '../../../components/Layout/SubHeader/SubHeader';
import { NotificationContext } from '../../../context/NotificationContext';
import { getMyChannel, updateChannel } from '../../../services/channel/channelService';
import { ChannelData } from '../../../types/services/channel';

import styles from './EditChannel.module.css';

const EditChannel = () => {
  const [formData, setFormData] = useState<ChannelData>({
    id: '',
    name: '',
    nickname: '',
    biography: '',
    externalLink: '',
    imageUrl: ''
  });

  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const notificationContext = useContext(NotificationContext);
  if (!notificationContext) {
    throw new Error('NotificationContext não foi fornecido!');
  }
  const { setMessage } = notificationContext;

  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const channelData = await getMyChannel();
        setFormData({
          id: channelData.id,
          name: channelData.name ?? '',
          nickname: channelData.nickname ?? '',
          biography: channelData.biography ?? '',
          externalLink: channelData.externalLink ?? '',
          imageUrl: channelData.imageUrl ?? ''
        });
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
      }
    };

    fetchChannelData();

    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (
        (name === 'name' && value.length <= 30) ||
        (name === 'biography' && value.length <= 200) ||
        name === 'externalLink'
      ) {
        setFormData((prev) => ({
          ...prev,
          [name]: value
        }));
      }
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.name.length > 30 || (formData.biography?.length ?? 0) > 200) {
        setError('Nome do canal não pode exceder 30 caracteres e biografia 200 caracteres.');
        setShowNotification(true);
        return;
      }

      try {
        await updateChannel(formData.id, formData);
        setMessage('Dados do canal atualizados com sucesso!');
        router.push(`/${formData.nickname}`);
      } catch (err) {
        console.error('Erro ao atualizar dados do canal:', err);
        setError('Erro ao atualizar dados do canal. Tente novamente.');
        setShowNotification(true);
      }
    },
    [formData, router, setMessage]
  );

  return (
    <div className={styles.editChannelPage}>
      <Head>
        <title>Editar Canal</title>
        <meta name="description" content="Edite seu canal de divulgação" />
      </Head>

      {showNotification && <Notification message={error} onClose={() => setShowNotification(false)} />}

      {isMobile && <MobileHeader title="Editar canal" buttons={{ close: true }} handleBack={handleBack} />}

      <div className={styles.editChannelContainer}>
        <SubHeader title="Editar canal" handleBack={handleBack} />
        <form onSubmit={handleSubmit}>
          <Card title="Alterar">
            <CustomInput
              title="Nome do canal"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              bottomLeftText={`Caracteres restantes: ${30 - formData.name.length}`}
            />
            <CustomInput
              title="Biografia"
              type="text"
              name="biography"
              value={formData.biography ?? ''}
              onChange={handleChange}
              bottomLeftText={`Caracteres restantes: ${200 - (formData.biography?.length ?? 0)}`}
            />
            <CustomInput
              title="Link Externo"
              type="text"
              name="externalLink"
              value={formData.externalLink ?? ''}
              onChange={handleChange}
            />
          </Card>

          <div className={styles.confirmationButtonSpace}>
            <StageButton text="Salvar" backgroundColor="#7B33E5" type="submit" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default memo(EditChannel);
