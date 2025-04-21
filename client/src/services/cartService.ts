import api from './api';
import { CartItemRequest, CartDTO } from '../types/services/cart';

/* ---------- Adiciona ou ATUALIZA item ---------- */
export async function addOrUpdateCartItem(
  item: CartItemRequest
): Promise<CartDTO> {
  const { data } = await api.post<CartDTO>('/cart/items', item);
  return data;
}

/* ---------- Obtém carrinho completo ------------ */
export async function getCart(): Promise<CartDTO> {
  const { data } = await api.get<CartDTO>('/cart');
  return data;
}
