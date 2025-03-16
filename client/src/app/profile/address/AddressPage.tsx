'use client';

import React, { Suspense, useCallback, useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter, useSearchParams } from 'next/navigation';

import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import SubHeader from '@/components/Layout/SubHeader/SubHeader';
import Card from '@/components/UI/Card/Card';
import SeeData from '@/components/UI/SeeData/SeeData';
import { getAddresses } from '@/services/profileService';

import { useNotification } from '@/hooks/useNotification';

import styles from './address.module.css';

interface Address {
  id: string;
  cep: string;
  city: string;
  state: string;
  street: string;
  recipientName: string;
  recipientPhone: string;
}

function AddressPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setMessage } = useNotification();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Recupera parâmetros da URL
  const selectMode = searchParams.get('selectMode') === '1';
  // Caso não seja definido o returnTo, define uma rota padrão (pode ser ajustado conforme sua necessidade)
  const returnTo = searchParams.get('returnTo') || '/channel/catalog/add';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await getAddresses();
        setAddresses(data);
      } catch (error) {
        console.error('Erro ao buscar endereços:', error);
        setMessage('Erro ao buscar endereços. Tente novamente.', 'error');
      }
    };

    fetchAddresses();
  }, [setMessage]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleSelect = (address: Address) => {
    if (selectMode) {
      const queryString = new URLSearchParams({
        selectedAddressId: address.id,
        selectedAddressStreet: address.street || '',
        selectedAddressCep: address.cep || '',
        selectedAddressCity: address.city || '',
        selectedAddressState: address.state || '',
        selectedAddressRecipientName: address.recipientName || '',
        selectedAddressRecipientPhone: address.recipientPhone || '',
      }).toString();

      router.push(`${returnTo}?${queryString}`);
    }
  };

  return (
    <div className={styles['address-page']}>
      <Head>
        <title>Endereço</title>
        <meta
          name="description"
          content="Gerencie suas preferências de privacidade na Nilrow."
        />
      </Head>

      {isMobile && (
        <MobileHeader
          title="Endereço"
          buttons={{ close: true }}
          handleBack={handleBack}
        />
      )}

      <div className={styles['address-container']}>
        <SubHeader title="Endereço" handleBack={handleBack} />

        <Card
          title="Cadastrados"
          rightLink={
            !selectMode
              ? { href: '/profile/address/add', text: '+ Adicionar endereço' }
              : undefined
          }
        >
          <div className={styles['address-see-data-wrapper']}>
            {addresses.map((address: Address) => (
              <SeeData
                key={address.id}
                title={address.street}
                content={`CEP: ${address.cep} - ${address.city}/${address.state}`}
                stackContent={true}
                subContent={`${address.recipientName} - ${address.recipientPhone}`}
                linkText={selectMode ? 'Selecionar' : 'Editar'}
                onClick={selectMode ? () => handleSelect(address) : undefined}
                link={!selectMode ? `/profile/address/${address.id}/edit` : undefined}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function AddressPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AddressPageContent />
    </Suspense>
  );
}
