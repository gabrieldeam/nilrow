'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import { addOrUpdateCartItem, getCart, clearLocalBag  } from '@/services/cartService';

export interface BagItem {
  id: string;
  productId?: string;
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
      productId: i.productId,          // ← ADICIONE
      isVariation: !!i.variationId,
      quantity: i.quantity,
    }));


export const BagProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [bag, setBag] = useState<BagItem[]>([]);

  useEffect(() => {
    if (authLoading) return;
    // sempre busca o cart “unificado”
    getCart()
      .then(({ items }) => setBag(mapServerCart({ items })))
      .catch((err) => console.error('Falha ao carregar carrinho:', err));
  }, [authLoading, isAuthenticated]);

/* ---------- push itens locais quando o user logar ---------- */
useEffect(() => {
  if (!isAuthenticated) return;

  const offlineRaw = localStorage.getItem('bag');
  if (!offlineRaw) return;

  const offline: BagItem[] = JSON.parse(offlineRaw);
  if (!offline.length) return;

  (async () => {
    await Promise.all(
      offline.map((i) =>
        addOrUpdateCartItem(
          i.isVariation
            ? { variationId: i.id, quantity: i.quantity }
            : { productId: i.id, quantity: i.quantity },
        ),
      ),
    );
    clearLocalBag();
    const { items } = await getCart();
    setBag(mapServerCart({ items }));
  })();
}, [isAuthenticated]);

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
    optimisticUpdate(item, delta);
  
    addOrUpdateCartItem(
      item.isVariation
      ? { variationId: item.id, productId: item.productId, quantity: delta }
        : { productId: item.id, quantity: delta },
    ).catch(async () => {
      // rollback: carrega estado real
      try {
        const { items } = await getCart();
        setBag(mapServerCart({ items }));
      } catch (e) {
        console.error('Rollback falhou:', e);
      }
    });
  };
  

  const removeFromBag = (item: BagItem) => {
    const current = bag.find((x) => x.id === item.id);
    if (current) changeQuantity(item, -current.quantity);
  };

  const clearBag = async () => {
    // snapshot, para usarmos depois de setBag([])
    const snapshot = [...bag];
  
    setBag([]);                 // esvazia immédiatement a UI
  
    if (isAuthenticated) {
      /*  Envia delta negativo de cada item  */
      await Promise.all(
        snapshot.map((i) =>
          addOrUpdateCartItem(
            i.isVariation
            ? { variationId: i.id, productId: i.productId, quantity: -i.quantity }
              : { productId: i.id, quantity: -i.quantity },
          ),
        ),
      );
    } else {
      clearLocalBag();          // remove do localStorage
    }
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
