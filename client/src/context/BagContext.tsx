"use client";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/hooks/useAuth";
import { addOrUpdateCartItem, getCart } from "@/services/cartService";
import type { CartItemRequest } from "@/types/services/cart";

export interface BagItem {
  /** Sempre o ID que será enviado ao back‑end            */
  id: string;
  /** `true` se o ID for de uma *variação*                */
  isVariation?: boolean;
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
  const { isAuthenticated, loading: authLoading } = useAuth();

  /* ---------------- estado local ---------------- */
  const [bag, setBag] = useState<BagItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("bag");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  /* ---------------- persiste no localStorage ---------------- */
  useEffect(() => {
    if (!isAuthenticated) {
      // só persistimos se estiver offline
      localStorage.setItem("bag", JSON.stringify(bag));
    }
  }, [bag, isAuthenticated]);

  /* ---------------- sincroniza após login ---------------- */
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const sync = async () => {
        // 1) envia cada item salvo localmente
        if (bag.length) {
          await Promise.all(
            bag.map((b) =>
              addOrUpdateCartItem(
                b.isVariation
                  ? { variationId: b.id, quantity: b.quantity }
                  : { productId: b.id,   quantity: b.quantity }
              )
            )
          );
          // limpa localStorage
          localStorage.removeItem("bag");
        }
        // 2) carrega carrinho atual do servidor
        const serverBag = await getCart();
        const mapped: BagItem[] = serverBag.items.map((i) => ({
          id:          i.variationId ?? i.productId,
          isVariation: !!i.variationId,
          quantity:    i.quantity,
        }));
        setBag(mapped);
      }
      ;
      sync();
    }
  }, [isAuthenticated, authLoading]); // ← roda uma única vez após login

  /* ---------------- actions ---------------- */
  const addToBag = (item: BagItem) => {
    if (isAuthenticated) {
      addOrUpdateCartItem(
        item.isVariation
          ? { variationId: item.id, quantity: item.quantity }
          : { productId:  item.id, quantity: item.quantity }
      ).then((serverBag) => {
        const mapped: BagItem[] = serverBag.items.map((i) => ({
          id:          i.variationId ?? i.productId,
          isVariation: !!i.variationId,
          quantity:    i.quantity,
        }));
        setBag(mapped);
      });
    } else {
      // offline → local state / storage
      setBag((prev) => {
        const existing = prev.find((x) => x.id === item.id);
        if (existing) {
          return prev.map((x) =>
            x.id === item.id
              ? { ...x, quantity: x.quantity + item.quantity }
              : x
          );
        }
        return [...prev, item];
      });
    }
  };

/* ---------------- removeFromBag ---------------- */
const removeFromBag = (id: string) => {
  const item = bag.find((x) => x.id === id);
  if (!item) return;

  if (isAuthenticated) {
    addOrUpdateCartItem(
      item.isVariation ? { variationId: id, quantity: 0 }
                       : { productId:  id, quantity: 0 }
    ).then((serverBag) => {
      const mapped: BagItem[] = serverBag.items.map((i) => ({
        id:          i.variationId ?? i.productId,
        isVariation: !!i.variationId,
        quantity:    i.quantity,
      }));
      setBag(mapped);
    });
  } else {
    setBag((prev) => prev.filter((x) => x.id !== id));
  }
};

  const clearBag = () => {
    if (isAuthenticated) {
      // chama API que zere ou remove todos (implemente se necessário)
      // por ora só zeramos localmente para UX rápido
    }
    setBag([]);
    localStorage.removeItem("bag");
  };

  /* -------------------------------------------------------- */
  return (
    <BagContext.Provider value={{ bag, addToBag, removeFromBag, clearBag }}>
      {children}
    </BagContext.Provider>
  );
};

export const useBag = (): BagContextProps => {
  const ctx = useContext(BagContext);
  if (!ctx) throw new Error("useBag must be used within BagProvider");
  return ctx;
};
