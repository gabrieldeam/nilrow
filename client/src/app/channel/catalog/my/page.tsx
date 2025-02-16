'use client';

import React, { memo, useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import StepButton from '@/components/UI/StepButton/StepButton';
import Card from '@/components/UI/Card/Card';
import SeeData from '@/components/UI/SeeData/SeeData';

import promoterIcon from '../../../../../public/assets/promoter.svg';
import addressProfileIcon from '../../../../../public/assets/addressProfile.svg';
import dataeditIcon from '../../../../../public/assets/dataedit.svg';
import infoIcon from '../../../../../public/assets/info.svg';
import previewIcon from '../../../../../public/assets/preview.svg';
import productsIcon from '../../../../../public/assets/products.svg';
import ordersCatalogIcon from '../../../../../public/assets/ordersCatalog.svg';
import invoiceIcon from '../../../../../public/assets/invoice.svg';
import eventsIcon from '../../../../../public/assets/events.svg';

import { isCatalogReleased, isCatalogVisible, updateCatalogVisibility } from '@/services/catalogService';
import { useNotification } from '@/hooks/useNotification';

import styles from './MyCatalog.module.css';

const MyCatalog: React.FC = () => {
  const { setMessage } = useNotification();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [badgeText, setBadgeText] = useState<string>('Em analise');
  const [badgeBackgroundColor, setBadgeBackgroundColor] = useState<string>('#DF1414');
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const handleBack = useCallback(() => {
    router.push('/channel/catalog');
  }, [router]);

  const handleOrders = useCallback(() => {
    router.push('/channel/catalog');
  }, [router]);

  useEffect(() => {
    // Verifica se é mobile (somente no cliente)
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    // Em Next.js (app directory) não há location.state.
    // Utilize os parâmetros da URL ou o localStorage.
    const queryCatalogId = searchParams.get('catalogId');
    if (queryCatalogId) {
      setCatalogId(queryCatalogId);
      localStorage.setItem('selectedCatalogId', queryCatalogId);
    } else {
      const storedCatalogId = localStorage.getItem('selectedCatalogId');
      if (storedCatalogId) {
        setCatalogId(storedCatalogId);
      } else {
        router.push('/channel/catalog');
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (catalogId) {
      isCatalogReleased(catalogId)
        .then((released: boolean) => {
          if (released) {
            setBadgeText('Liberado');
            setBadgeBackgroundColor('#4FBF0A');
          } else {
            setBadgeText('Em analise');
            setBadgeBackgroundColor('#DF1414');
          }
        })
        .catch((error: any) => {
          console.error('Erro ao verificar liberação do catálogo:', error);
        });

      isCatalogVisible(catalogId)
        .then((visible: boolean) => {
          setIsVisible(visible);
        })
        .catch((error: any) => {
          console.error('Erro ao verificar visibilidade do catálogo:', error);
        });
    }
  }, [catalogId]);

  const handleToggleVisibility = useCallback(() => {
    if (catalogId) {
      updateCatalogVisibility(catalogId, !isVisible)
        .then(() => {
          setIsVisible(!isVisible);
          setMessage('Visibilidade do catálogo atualizada com sucesso!', 'success');
        })
        .catch((error: any) => {
          const errorMessage =
            error.response?.data?.message || 'Erro ao atualizar a visibilidade do catálogo.';
          setMessage(errorMessage, 'error');
          console.error('Erro ao atualizar a visibilidade do catálogo:', error);
        });
    }
  }, [catalogId, isVisible, setMessage]);

  const handleEditCatalog = useCallback(() => {
    if (catalogId) {
      router.push(`/channel/catalog/my/edit?${catalogId}`);
    }
  }, [catalogId, router]);

  return (
    <div className={styles.myCatalogPage}>
      <Head>
        <title>Meu Catálogo</title>
        <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
      </Head>

      {isMobile && (
        <MobileHeader title="Meu Catálogo" buttons={{ close: true, orders: true }} handleBack={handleBack} />
      )}

      <div className={styles.myCatalogContainer}>
        <div className={styles.myCatalogHeader}>
          <SubHeader title="Meu Catálogo" handleBack={handleBack} showOrdersButton={true} handleOrders={handleOrders} />
        </div>
        <div className={styles.myCatalogAdditionalSteps}>
          <div className={styles.myCatalogAdditional}>
            <StepButton
              icon={dataeditIcon}
              title="Dados da empresa"
              paragraph="Informações da sua empresa e informações sobre funcionamento."
              onClick={handleEditCatalog}
            />
            <StepButton
              icon={previewIcon}
              title="Visualização"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos"
              onClick={() => router.push(`/channel/catalog/my/visualization?catalogId=${catalogId || ''}`)}
            />
            <StepButton
              icon={productsIcon}
              title="Produtos"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
              onClick={() => router.push('/channel/catalog/my/product')}
            />
            <StepButton
              icon={ordersCatalogIcon}
              title="Pedidos"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
              onClick={() => router.push('/channel/catalog/my/depois-colocar')}
            />
          </div>
          <div className={styles.myCatalogAdditional}>
            <StepButton
              icon={addressProfileIcon}
              title="Entrega"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
              onClick={() => router.push('/channel/catalog/my/depois-colocar')}
            />
            <StepButton
              icon={promoterIcon}
              title="Pagamento"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
              onClick={() => router.push('/channel/catalog/my/catalog')}
            />
            <StepButton
              icon={invoiceIcon}
              title="Notal fiscal"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
              onClick={() => router.push('/channel/catalog/my/depois-colocar')}
            />
            <StepButton
              icon={eventsIcon}
              title="Eventos"
              paragraph="Escolha onde seus produtos poderão ser vistos e vendidos."
              onClick={() => router.push('/channel/catalog/my/depois-colocar')}
            />
          </div>
          <Card title="Status">
            <div className={styles.seeDataWrapper}>
              <div className={styles.myCatalogElementInfo}>
                <Image
                  src={infoIcon}
                  alt="info"
                  className={styles.myCatalogInfoIcon}
                />
                <div className={styles.myCtalogElementInfoText}>
                  <p>
                    Isso irá mostrar seus produtos na plataforma quanto ativo e liberado e irá retirar de tudo se não tiver ativo.
                  </p>
                  <a href="/" className={styles.myCatalogLearnMoreLink}>
                    Saiba mais sobre
                  </a>
                </div>
              </div>
              <SeeData
                title="Mostrar no canal"
                content="Mostrar o catálogo e todos os produtos associados a ele no seu canal."
                stackContent={true}
                showToggleButton={true}
                onToggle={handleToggleVisibility}
                toggled={isVisible}
              />
              <SeeData
                title="Liberação da nilrow"
                content="Liberação da comercialização pela nilrow."
                stackContent={true}
                badgeText={badgeText}
                badgeBackgroundColor={badgeBackgroundColor}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default memo(MyCatalog);
