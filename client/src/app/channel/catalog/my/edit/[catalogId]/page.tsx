'use client';

import { Suspense } from 'react';
import EditCatalog from './EditCatalog';

export default function EditCatalogPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <EditCatalog />
    </Suspense>
  );
}
