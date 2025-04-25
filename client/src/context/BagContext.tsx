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

/* ---------- util ---------- */
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

  /* ---------- offline load ---------- */
  useEffect(() => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('bag');
      setBag(saved ? JSON.parse(saved) : []);
    }
  }, [isAuthenticated]);

  /* ---------- offline persist ---------- */
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

  /* ---------- optimistic helper ---------- */
  const optimisticUpdate = (item: BagItem, delta: number) =>
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

  /* ---------- actions ---------- */
  const changeQuantity = (item: BagItem, delta: number) => {
    if (delta === 0) return;

    /* --- otimista (UI) --- */
    optimisticUpdate(item, delta);

    /* --- logado: envia pro backend, mas NÃO sobrescreve state --- */
    if (isAuthenticated) {
      const payload = item.isVariation
        ? { variationId: item.id, quantity: delta }
        : { productId: item.id, quantity: delta };

      addOrUpdateCartItem(payload).catch(async (err) => {
        console.error(err);
        /* rollback se falhar */
        try {
          const fresh = await getCart();
          setBag(mapServerCart(fresh));
        } catch (e) {
          console.error('Falha no rollback:', e);
        }
      });
    }
  };

  const removeFromBag = (item: BagItem) => {
    const current = bag.find((x) => x.id === item.id);
    if (current) changeQuantity(item, -current.quantity);
  };

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
