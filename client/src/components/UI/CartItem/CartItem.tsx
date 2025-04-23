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
  const { addToBag, decrementFromBag, removeFromBag } = useBag();

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
            {item.name.length > 90 ? item.name.slice(0, 90) + '…' : item.name}
          </h3>

          <div className={styles.itemAttributes}>
            {item.attributes.map((attr) => (
              <span key={attr.id} className={styles.attribute}>
                {attr.attributeName}: {attr.attributeValue}
              </span>
            ))}
          </div>

          <div className={styles.quantityControls}>
            <button
              onClick={() => decrementFromBag(item.id)}
              disabled={item.quantity <= 1}
            >
              –
            </button>
            <span>{item.quantity}</span>
            <button
              onClick={() =>
                addToBag({
                  id: item.id,
                  isVariation: !!item.variationId,
                  quantity: 1,
                })
              }
            >
              +
            </button>
          </div>
        </div>

        {/* Excluir */}
        <button
          className={styles.itemRemover}
          onClick={() => removeFromBag(item.id)}
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
