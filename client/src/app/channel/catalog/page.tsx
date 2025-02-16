'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import SeeData from '@/components/UI/SeeData/SeeData';
import { getVisibleCatalogs, getHiddenCatalogs } from '@/services/catalogService';
import { getAddressById } from '@/services/profileService';

import { CatalogDataWithAddress } from '@/types/services/catalog';

import styles from './Catalog.module.css';

const Catalog = () => {
  const [visibleCatalogs, setVisibleCatalogs] = useState<CatalogDataWithAddress[]>([]);
  const [hiddenCatalogs, setHiddenCatalogs] = useState<CatalogDataWithAddress[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
  }, []);

  const handleBack = useCallback(() => {
    router.push('/channel/catalog/my');
  }, [router]);

  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const visible = await getVisibleCatalogs();
        const hidden = await getHiddenCatalogs();

        const visibleWithAddresses = await Promise.all(
          visible.map(async (catalog) => {
            if (catalog.addressId) {
              const address = await getAddressById(catalog.addressId);
              return { ...catalog, address };
            }
            return { ...catalog, address: null }; // Evita erro caso não tenha addressId
          })
        );

        const hiddenWithAddresses = await Promise.all(
          hidden.map(async (catalog) => {
            if (catalog.addressId) {
              const address = await getAddressById(catalog.addressId);
              return { ...catalog, address };
            }
            return { ...catalog, address: null };
          })
        );

        setVisibleCatalogs(visibleWithAddresses);
        setHiddenCatalogs(hiddenWithAddresses);
      } catch (error) {
        console.error('Erro ao buscar catálogos:', error);
      }
    };

    fetchCatalogs();
  }, []);

  const handleManageClick = (catalogId: string) => {
    localStorage.setItem('selectedCatalogId', catalogId);
    router.push('/channel/catalog/my');
  };

  const renderCatalog = (catalog: CatalogDataWithAddress) => (
    <SeeData 
      key={catalog.id}
      title={catalog.title}
      content={
        catalog.address 
          ? `CEP: ${catalog.address.cep} - ${catalog.address.city}, ${catalog.address.state}`
          : 'Endereço não disponível'
      }
      subContent={`CNPJ: ${catalog.cnpj || 'Não informado'}`} 
      stackContent
      linkText="Gerenciar"                        
      link="#"
      onClick={() => handleManageClick(catalog.id)}
    />
  );
  
  const renderEmptyMessage = (message: string) => (
    <div className={styles.emptyCatalogMessage}>
      {message}
    </div>
  );

  return (
    <div className={styles.catalogPage}>
      <Head>
        <title>Catálogo</title>
        <meta name="description" content="Gerencie suas preferências de privacidade na Nilrow." />
      </Head>
      {isMobile && (
        <MobileHeader title="Catálogo" buttons={{ close: true }} handleBack={handleBack} />
      )}
      <div className={styles.catalogContainer}>
        <div className={styles.catalogHeader}>
          <SubHeader title="Catálogo" handleBack={handleBack} />
        </div>
        <Card 
          title="Cadastrados"
          rightLink={{ href: "/channel/catalog/add", text: "+ Adicionar catálogo" }}
        >
          <div className={styles.catalogSeeDataWrapper}>
            {hiddenCatalogs.length > 0 
              ? hiddenCatalogs.map(renderCatalog) 
              : renderEmptyMessage("Nenhum catálogo cadastrado.")}
          </div>
          <Card title="Visíveis no canal">
          <div className={styles.catalogSeeDataWrapper}>
            {visibleCatalogs.length > 0 
              ? visibleCatalogs.map(renderCatalog) 
              : renderEmptyMessage("Nenhum catálogo visível no canal.")}
          </div>
        </Card>
        </Card>        
      </div>
    </div>
  );
};

export default Catalog;
