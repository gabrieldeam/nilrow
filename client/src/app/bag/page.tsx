"use client";

import React from 'react';
import { useBag } from '@/context/BagContext';

const BagPage = () => {
  const { bag, removeFromBag, clearBag } = useBag();

  return (
    <div style={{ marginTop: '20rem' }}>
      <h1>bag</h1>
      {bag.length === 0 ? (
        <p>O carrinho está vazio.</p>
      ) : (
        <ul>
          {bag.map(item => (
            <li key={item.id}>
              <p>Produto ID: {item.id}</p>
              <p>Quantidade: {item.quantity}</p>
              {item.nickname && <p>Nickname: {item.nickname}</p>}
              <button onClick={() => removeFromBag(item.id)}>Remover</button>
            </li>
          ))}
        </ul>
      )}
      {bag.length > 0 && (
        <button onClick={clearBag} style={{ marginTop: '1rem' }}>
          Limpar bag
        </button>
      )}
    </div>
  );
};

export default BagPage;
