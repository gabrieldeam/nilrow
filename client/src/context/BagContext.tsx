'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addOrUpdateCartItem, getCart } from '@/services/cartService';

export interface BagItem {
  id: string;
  isVariation?: boolean;
  quantity: number;
}

interface BagContextProps {
  bag: BagItem[];
  changeQuantity: (item: BagItem, delta: number) => void;
  removeFromBag: (item: BagItem) => void;
  clearBag: () => void;
}

const BagContext = createContext<BagContextProps | undefined>(undefined);

const mapServerCart = (serverCart: any): BagItem[] =>
  serverCart.items
    .filter((i: any) => i.quantity > 0)
    .map((i: any) => ({
      id: i.variationId ?? i.productId,
      isVariation: !!i.variationId,
      quantity: i.quantity,
    }));

export const BagProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bag, setBag] = useState<BagItem[]>([]);

  /* ---------- offline ---------- */
  useEffect(() => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('bag');
      setBag(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('bag', JSON.stringify(bag));
    }
  }, [bag, isAuthenticated]);

  /* ---------- sync after login ---------- */
  const syncBag = async () => {
    try {
      const offline = localStorage.getItem('bag');
      if (offline) {
        const offlineItems: BagItem[] = JSON.parse(offline);
        await Promise.all(
          offlineItems.map((item) =>
            addOrUpdateCartItem(
              item.isVariation
                ? { variationId: item.id, quantity: item.quantity }
                : { productId: item.id, quantity: item.quantity },
            ),
          ),
        );
        localStorage.removeItem('bag');
      }
      const serverCart = await getCart();
      setBag(mapServerCart(serverCart));
    } catch (err) {
      console.error('Erro ao sincronizar carrinho:', err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    isAuthenticated ? syncBag() : setBag([]);
  }, [authLoading, isAuthenticated]);

  /* ---------------- ações ---------------- */
  const changeQuantity = (item: BagItem, delta: number) => {
    if (delta === 0) return;

    /* === USUÁRIO LOGADO ====================================== */
    if (isAuthenticated) {
      addOrUpdateCartItem(
        item.isVariation
          ? { variationId: item.id, quantity: delta }
          : { productId: item.id, quantity: delta },
      )
        .then((serverCart) => setBag(mapServerCart(serverCart)))
        .catch((err) => console.error(err));

      return;
    }

    /* === USUÁRIO ANÔNIMO (offline) =========================== */
    setBag((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) {
        const newQty = exists.quantity + delta;
        return newQty > 0
          ? prev.map((x) =>
              x.id === item.id ? { ...x, quantity: newQty } : x,
            )
          : prev.filter((x) => x.id !== item.id);
      }
      return delta > 0 ? [...prev, { ...item, quantity: delta }] : prev;
    });
  };

  const removeFromBag = (item: BagItem) => changeQuantity(item, -item.quantity);

  const clearBag = () => {
    setBag([]);
    localStorage.removeItem('bag');
  };

  return (
    <BagContext.Provider
      value={{ bag, changeQuantity, removeFromBag, clearBag }}
    >
      {children}
    </BagContext.Provider>
  );
};

export const useBag = (): BagContextProps => {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error('useBag must be used within BagProvider');
  return ctx;
};
