'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProductsInFavoriteFolder } from '@/services/favoriteService';
import { ProductDTO } from '@/types/services/product';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import defaultImg from '../../../../public/assets/user.png';

export default function FolderPage() {
  const { folderName } = useParams<{ folderName: string }>();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading]   = useState(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  useEffect(() => {
    if (!folderName) return;
    getProductsInFavoriteFolder(decodeURIComponent(folderName as string))
      .then((res) => setProducts(res.content))
      .finally(() => setLoading(false));
  }, [folderName]);

  if (loading) return <p>Carregando…</p>;

  return (
    <>
      <h2 style={{margin:'1rem 0'}}>Pasta: {decodeURIComponent(folderName as string)}</h2>

      {products.length === 0 ? (
        <p>Nenhum produto nesta pasta.</p>
      ) : (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(165px,1fr))',gap:'6px'}}>
          {products.map((p) => (
            <Link key={p.id} href={`/product/${p.id}`}>
              <ProductCard
                images={
                  p.images?.length ? p.images.map((img) => `${apiUrl}${img}`) : [defaultImg.src]
                }
                name={p.name}
                price={p.salePrice}
                discount={p.discountPrice}
                freeShipping={p.freeShipping}
              />
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
