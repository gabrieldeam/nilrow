'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { ModalInfoAddressProps } from '../../../types/components/Modals/ModalInfoAddress';

// Fazemos o import dinâmico do componente Leaflet
const DynamicModalInfoAddressLeaflet = dynamic(
  () => import('./ModalInfoAddressLeaflet'), 
  { ssr: false }
);

export default function ModalInfoAddress(props: ModalInfoAddressProps) {
  // Aqui simplesmente repassamos as props para o componente que realmente usa Leaflet
  return <DynamicModalInfoAddressLeaflet {...props} />;
}
