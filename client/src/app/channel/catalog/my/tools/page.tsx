'use client';

import React, { useState, memo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/UI/LoadingSpinner/LoadingSpinner';
import StepButton from '@/components/UI/StepButton/StepButton';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';

import eventsIcon from '../../../../../../public/assets/events.svg';
import cupomIcon from '../../../../../../public/assets/cupom.svg';

import styles from './tools.module.css';

function Tools() {
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
        <MobileHeader title="Ferramentas" buttons={{ close: true}} handleBack={handleBack} />
      )}

      {loading && <LoadingSpinner />}
      <div className={styles.administrationContainer}>
        <div className={styles.myCatalogHeader}>
          <SubHeader title="Ferramentas" handleBack={handleBack} />
        </div>
          <div className={styles.administrationList}>
            <StepButton
              icon={cupomIcon}
              title="Cupom"
              paragraph="Lista de usuários cadastrados"
              onClick={() => router.push('/channel/catalog/my/shipping/melhorenvio')}
            />
            <StepButton
              icon={eventsIcon}
              title="Eventos"
              paragraph="Crie e veja as categorias e subcategorias"
              onClick={() => router.push('/channel/catalog/my/shipping/delivery')} 
            />
          </div>  
      </div>
    </div>
  );
}

export default memo(Tools);
