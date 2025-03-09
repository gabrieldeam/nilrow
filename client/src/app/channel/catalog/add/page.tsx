import React, { Suspense } from 'react';
import AddCatalog from './AddCatalog';

export default function Page() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AddCatalog />
    </Suspense>
  );
}
