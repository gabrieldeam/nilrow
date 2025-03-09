// address/page.tsx
'use client';

import React, { Suspense } from 'react';
import AddressPage from './AddressPage'; // ou se o próprio arquivo contém a lógica, extraia-a para um componente

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AddressPage />
    </Suspense>
  );
}
