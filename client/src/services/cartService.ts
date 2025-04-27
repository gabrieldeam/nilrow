import api from './api';
import { CartItemRequest, CartDTO } from '@/types/services/cart';
import { BagItem } from '@/context/BagContext';
import { buildLocalCart } from './localCartService';
import { checkAuth } from './authService';

async function isUserAuthenticated(): Promise<boolean> {
  try {
    const resp = await checkAuth();      // pode disparar 401 ou falhar sem rede
    return resp.isAuthenticated;
  } catch {
    return false;                        // se falhou, tratamos como anônimo
  }
}

const LOCAL_KEY = 'bag';

/* ---------- util local ---------- */
function loadLocalBag(): BagItem[] {
  const raw = localStorage.getItem(LOCAL_KEY);
  return raw ? JSON.parse(raw) : [];
}
function saveLocalBag(bag: BagItem[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(bag));
}

export function clearLocalBag() {
  localStorage.removeItem(LOCAL_KEY);
}


/* ---------- Adiciona / ATUALIZA item ---------- */
export async function addOrUpdateCartItem(
  item: CartItemRequest,
): Promise<CartDTO> {
  const isAuthenticated = await isUserAuthenticated();

  if (isAuthenticated) {
    const { data } = await api.post<CartDTO>('/cart/items', item);
    return data;
  }

  /* ---- modo off-line ---- */
  const bag = loadLocalBag();
  const idx = bag.findIndex(
    (i) =>
      (!!i.isVariation ? i.id === (item as any).variationId : i.id === (item as any).productId),
  );
  if (idx !== -1) {
    bag[idx].quantity += (item as any).quantity;
    if (!bag[idx].productId && (item as any).productId) {
          bag[idx].productId = (item as any).productId;
    }
    if (bag[idx].quantity <= 0) bag.splice(idx, 1);
  } else if ((item as any).quantity > 0) {
    bag.push({
      id: (item as any).variationId ?? (item as any).productId,
      isVariation: !!(item as any).variationId, 
      productId:  (item as any).productId,
      quantity: (item as any).quantity,
    });
    
  }
  saveLocalBag(bag);

  return {
    items: await buildLocalCart(bag),
  } as CartDTO;
}

/* ---------- Obtém carrinho completo ---------- */
export async function getCart(): Promise<CartDTO> {
  const isAuthenticated = await isUserAuthenticated();

  if (isAuthenticated) {
    const { data } = await api.get<CartDTO>('/cart');
    return data;
  }

  /* ---- off-line ---- */
  const bag = loadLocalBag();
  return {
    items: await buildLocalCart(bag),
  } as CartDTO;
}
