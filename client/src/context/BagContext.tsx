'use client';

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  addOrUpdateCartItem,
  getCart,
  clearLocalBag,
} from '@/services/cartService';
import { useNotification } from '@/hooks/useNotification';

export interface BagItem {
  id: string;          // variationId ou productId
  productId?: string;  // obrigatório se for variação
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

/* ---------- helpers ---------- */
const mapServerCart = (serverCart: any): BagItem[] =>
  serverCart.items
    .filter((i: any) => i.quantity > 0)
    .map((i: any) => ({
      id: i.variationId ?? i.productId,
      productId: i.productId,
      isVariation: !!i.variationId,
      quantity: i.quantity,
    }));

const buildStockMap = (items: any[]) =>
  Object.fromEntries(
    items.map((i) => [
      i.variationId ?? i.productId,
      // disponível pode vir em qualquer um desses nomes
      i.availableStock ?? i.stock ?? Infinity,
    ]),
  );

export const BagProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { setMessage } = useNotification();

  const [bag, setBag] = useState<BagItem[]>([]);
  const [stockById, setStockById] = useState<Record<string, number>>({});

  /* ---------- bootstrap (online / offline) ---------- */
  useEffect(() => {
    if (authLoading) return;

    getCart()
      .then(({ items }) => {
        setBag(mapServerCart({ items }));
        setStockById(buildStockMap(items));
      })
      .catch((err) =>
        console.error('Falha ao carregar carrinho inicial:', err),
      );
  }, [authLoading, isAuthenticated]);

  /* ---------- migra carrinho local quando logar ---------- */
  useEffect(() => {
    if (!isAuthenticated) return;

    const raw = localStorage.getItem('bag');
    if (!raw) return;
    const offline: BagItem[] = JSON.parse(raw);
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
      localStorage.removeItem('bag');
      const { items } = await getCart();
      setBag(mapServerCart({ items }));
      setStockById(buildStockMap(items));
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

  /* ---------- ACTION: alterar quantidade ---------- */
  const changeQuantity = (item: BagItem, delta: number) => {
    if (delta === 0) return;

    /* --- verificação de estoque local --- */
    const max = stockById[item.id] ?? Infinity;
    const current = bag.find((b) => b.id === item.id)?.quantity ?? 0;
    if (delta > 0 && current + delta > max) {
      setMessage(`Máximo de ${max} unidades disponível.`, 'warning');
      return;
    }

    optimisticUpdate(item, delta);

    addOrUpdateCartItem(
      item.isVariation
        ? { variationId: item.id, productId: item.productId, quantity: delta }
        : { productId: item.id, quantity: delta },
    ).catch(async (err) => {
      /* --- backend pode devolver msg de limite --- */
      const backendMsg =
        err?.response?.data?.message ??
        err?.response?.data?.error ??
        null;
      if (backendMsg) {
        setMessage(backendMsg, 'warning');
      } else {
        console.error('Erro ao atualizar quantidade:', err);
      }

      /* rollback e ressincroniza estoque */
      try {
        const { items } = await getCart();
        setBag(mapServerCart({ items }));
        setStockById(buildStockMap(items));
      } catch (e) {
        console.error('Rollback falhou:', e);
      }
    });
  };

  /* ---------- ACTION: remover item ---------- */
  const removeFromBag = (item: BagItem) => {
    const current = bag.find((x) => x.id === item.id);
    if (current) changeQuantity(item, -current.quantity);
  };

  /* ---------- ACTION: limpar carrinho ---------- */
  const clearBag = async () => {
    const snapshot = [...bag];
    setBag([]);

    if (isAuthenticated) {
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
      clearLocalBag();
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
