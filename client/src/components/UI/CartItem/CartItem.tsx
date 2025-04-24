'use client';

import React from 'react';
import Image from 'next/image';
import { CartItemDTO } from '@/types/services/cart';
import { useBag } from '@/context/BagContext';
import styles from './CartItem.module.css';

interface CartItemProps {
  item: CartItemDTO;
  apiUrl: string;
}

export default function CartItem({ item, apiUrl }: CartItemProps) {
  const { bag, changeQuantity, removeFromBag } = useBag();

  /* --- converte para BagItem (id + isVariation) --- */
  const bagItem = {
    id: item.variationId ?? item.productId,
    isVariation: !!item.variationId,
    quantity: item.quantity, // fallback
  };

  /* --- pega a quantidade mais recente no contexto --- */
  const currentQty =
    bag.find((x) => x.id === bagItem.id)?.quantity ?? bagItem.quantity;

  return (
    <div className={styles.cartItem}>
      <Image
        className={styles.itemImage}
        src={`${apiUrl}${item.imageUrl}`}
        alt={item.name}
        width={140}
        height={140}
      />

      <div className={styles.itemContent}>
        <div className={styles.itemDetails}>
          <h3 className={styles.itemName}>
            {item.name.length > 60 ? `${item.name.slice(0, 60)}…` : item.name}
          </h3>

          <div className={styles.itemAttributes}>
            {item.attributes.map((attr) => (
              <span key={attr.id} className={styles.attribute}>
                {attr.attributeName}: {attr.attributeValue}
              </span>
            ))}
          </div>

          <div className={styles.quantityControls}>
            <button onClick={() => changeQuantity(bagItem, -1)}>–</button>
            <span>{currentQty}</span>
            <button onClick={() => changeQuantity(bagItem, +1)}>+</button>
          </div>
        </div>

        <button
          className={styles.itemRemover}
          onClick={() => removeFromBag(bagItem)}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
