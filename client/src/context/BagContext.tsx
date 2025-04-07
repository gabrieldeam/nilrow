"use client";

import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from 'react';

export interface BagItem {
  id: string;
  quantity: number;
  nickname?: string;
}

interface BagContextProps {
  bag: BagItem[];
  addToBag: (item: BagItem) => void;
  removeFromBag: (id: string) => void;
  clearBag: () => void;
}

const BagContext = createContext<BagContextProps | undefined>(undefined);

export const BagProvider = ({ children }: { children: ReactNode }) => {
  // Inicializa o estado a partir do localStorage, se disponível.
  const [bag, setBag] = useState<BagItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedBag = localStorage.getItem('bag');
      return savedBag ? JSON.parse(savedBag) : [];
    }
    return [];
  });

  // Sempre que o estado "bag" mudar, atualiza o localStorage.
  useEffect(() => {
    localStorage.setItem('bag', JSON.stringify(bag));
  }, [bag]);

  const addToBag = (item: BagItem) => {
    setBag((prevBag) => {
      const existingItem = prevBag.find(bagItem => bagItem.id === item.id);
      if (existingItem) {
        return prevBag.map(bagItem =>
          bagItem.id === item.id
            ? { ...bagItem, quantity: bagItem.quantity + item.quantity }
            : bagItem
        );
      }
      return [...prevBag, item];
    });
  };

  const removeFromBag = (id: string) => {
    setBag((prevBag) => prevBag.filter(item => item.id !== id));
  };

  const clearBag = () => {
    setBag([]);
  };

  return (
    <BagContext.Provider value={{ bag, addToBag, removeFromBag, clearBag }}>
      {children}
    </BagContext.Provider>
  );
};

export const useBag = (): BagContextProps => {
  const context = useContext(BagContext);
  if (!context) {
    throw new Error('useBag must be used within a BagProvider');
  }
  return context;
};
