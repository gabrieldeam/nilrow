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

export interface BagItem {
  id: string;
  isVariation?: boolean;
  quantity: number;
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

  /* ---------------- persiste no localStorage (offline) ---------------- */
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("bag", JSON.stringify(bag));
    }
  }, [bag, isAuthenticated]);

  /* ---------------- sincroniza OFFLINE → ONLINE no momento do login ---------------- */
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      // 1) lê o que havia no localStorage
      const saved = localStorage.getItem("bag");
      if (saved) {
        const offlineItems: BagItem[] = JSON.parse(saved);

        // 2) dispara todas as requisições de addOrUpdate
        Promise.all(
          offlineItems.map((item) =>
            addOrUpdateCartItem(
              item.isVariation
                ? { variationId: item.id, quantity: item.quantity }
                : { productId: item.id, quantity: item.quantity }
            )
          )
        )
          .then(() => {
            // 3) limpa o armazenamento local
            localStorage.removeItem("bag");
            // 4) busca o carrinho definitivo no servidor
            return getCart();
          })
          .then((serverCart) => {
            // 5) mapeia pro formato BagItem e atualiza o state
            const mapped: BagItem[] = serverCart.items.map((i) => ({
              id: i.variationId ?? i.productId,
              isVariation: !!i.variationId,
              quantity: i.quantity,
            }));
            setBag(mapped);
          })
          .catch((err) => {
            console.error("Erro ao sincronizar carrinho:", err);
          });
      } else {
        // se não havia nada offline, só busca o carrinho atual
        getCart().then((serverCart) => {
          const mapped: BagItem[] = serverCart.items.map((i) => ({
            id: i.variationId ?? i.productId,
            isVariation: !!i.variationId,
            quantity: i.quantity,
          }));
          setBag(mapped);
        });
      }
    }
  }, [authLoading, isAuthenticated]);

  /* ---------------- ações do contexto ---------------- */
  const addToBag = (item: BagItem) => {
    if (isAuthenticated) {
      addOrUpdateCartItem(
        item.isVariation
          ? { variationId: item.id, quantity: item.quantity }
          : { productId:  item.id, quantity: item.quantity }
      ).then((serverCart) => {
        const mapped = serverCart.items.map((i) => ({
          id: i.variationId ?? i.productId,
          isVariation: !!i.variationId,
          quantity: i.quantity,
        }));
        setBag(mapped);
      });
    } else {
      setBag((prev) => {
        const exists = prev.find((x) => x.id === item.id);
        if (exists) {
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

  const removeFromBag = (id: string) => {
    const item = bag.find((x) => x.id === id);
    if (!item) return;
    if (isAuthenticated) {
      addOrUpdateCartItem(
        item.isVariation ? { variationId: id, quantity: 0 }
                         : { productId:  id, quantity: 0 }
      ).then((serverCart) => {
        const mapped = serverCart.items.map((i) => ({
          id: i.variationId ?? i.productId,
          isVariation: !!i.variationId,
          quantity: i.quantity,
        }));
        setBag(mapped);
      });
    } else {
      setBag((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const clearBag = () => {
    if (isAuthenticated) {
      // você pode implementar um endpoint “DELETE /cart” ou similar
    }
    setBag([]);
    localStorage.removeItem("bag");
  };

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
