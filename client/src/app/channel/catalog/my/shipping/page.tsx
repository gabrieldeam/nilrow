'use client';

import React, { useState, memo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';
import StepButton from '@/components/UI/StepButton/StepButton';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';

import melhorenvioIcon from '../../../../../../public/assets/melhorenvio.svg';
import deliveryIcon from '../../../../../../public/assets/delivery.svg';
import removeIcon from '../../../../../../public/assets/remove.svg';
import schedulingIcon from '../../../../../../public/assets/scheduling.svg';

import styles from './shipping.module.css';

function Shipping() {
  const [loading] = useState(false);
  const router = useRouter();  
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my');
  }, [router]);

  useEffect(() => {
      setIsMobile(window.innerWidth <= 768);
    }, []);

  return (
    <div className={styles.administrationPage}>

      {isMobile && (
        <MobileHeader title="Meu Catálogo" buttons={{ close: true}} handleBack={handleBack} />
      )}

      {loading && <LoadingSpinner />}
      <div className={styles.administrationContainer}>
        <div className={styles.myCatalogHeader}>
          <SubHeader title="Meu Catálogo" handleBack={handleBack} />
        </div>
        <div className={styles.administrationList}>
          <StepButton
            icon={melhorenvioIcon}
            title="Melhor Envio"
            paragraph="Lista de usuários cadastrados"
            onClick={() => router.push('/channel/catalog/my/shipping/melhorenvio')}
          />
          <StepButton
            icon={deliveryIcon}
            title="Delivery"
            paragraph="Crie e veja as categorias e subcategorias"
            onClick={() => router.push('/channel/catalog/my/shipping/delivery')} 
          />
          </div>

          <div className={styles.administrationList}>
          <StepButton
            icon={removeIcon}
            title="Retirar"
            paragraph="Crie e veja as Marcas"
            onClick={() => router.push('/channel/catalog/my/shipping/pickup')} 
          />
          <StepButton
            icon={schedulingIcon}
            title="Agendar"
            paragraph="Crie e veja os Tamplates de Produtos"
            onClick={() => router.push('/channel/catalog/my/shipping/scheduling')} 
          />
        </div>
      </div>
    </div>
  );
}

export default memo(Shipping);
