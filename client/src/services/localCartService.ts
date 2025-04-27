import api from '@/services/api';
import {
  getProductById,
  getProductByIdWithDelivery,
  listVariationImagesByVariation,
} from '@/services/product/productService';      
import { BagItem } from '@/context/BagContext';
import { CartItemDTO } from '@/types/services/cart';


/**
 * Garante ao menos uma imagem válida:
 */
function firstImage(product: any): string | undefined {
  return product.images?.[0];
}

async function enrich(
  item: BagItem,
  latitude?: number,
  longitude?: number,
): Promise<CartItemDTO> {
  /** ----------------------------------------------------------------
   * 1)  Busca o produto completo – com verificação de entrega se
   *     tivermos coordenadas válidas; caso contrário, busca simples.
   * ----------------------------------------------------------------*/
  const prod = latitude !== undefined && longitude !== undefined
  ? await getProductByIdWithDelivery(
      item.isVariation ? item.productId! : item.id,
      latitude,
      longitude)
  : await getProductById(
      item.isVariation ? item.productId! : item.id);


  /** ----------------------------------------------------------------
   * 2)  Se for variação, extraímos os dados certos
   * ----------------------------------------------------------------*/
  let unitPrice = prod.salePrice;
  let discountPrice = prod.discountPrice;
  let attributes   = [] as any[];
  let imageUrl     = firstImage(prod);

  if (item.isVariation) {
    const varObj = prod.variations.find((v: any) => v.id === item.id);
    if (varObj) {
      unitPrice     = varObj.price ?? unitPrice;
      discountPrice = varObj.discountPrice ?? discountPrice;
      attributes    = varObj.attributes ?? [];
      // imagem da variação
      const imgs = await listVariationImagesByVariation(varObj.id!);
      if (imgs.length) imageUrl = imgs[0].imageUrl;
    }
  }

  /** ----------------------------------------------------------------
   * 3)  Monta o CartItemDTO mínimo que o <CartItem> precisa
   * ----------------------------------------------------------------*/
  const dto: CartItemDTO = {
    id: item.id,
    productId: prod.id!,
    variationId: item.isVariation ? item.id : null,
    name: prod.name,
    imageUrl,
    unitPrice,
    discountPrice,
    quantity: item.quantity,
    attributes,
    channel: prod.channel!,              // o endpoint já devolve
    catalogId: prod.catalogId,
  };

  return dto;
}

/** Converte toda a Bag local em um array pronto pra UI */
export async function buildLocalCart(
  bag: BagItem[],
  lat?: number,
  lon?: number,
): Promise<CartItemDTO[]> {
  const promises = bag.map(async (b) => {
    try {
      return await enrich(b, lat, lon);   // ← pode lançar
    } catch (e) {
      console.error('Falha ao enriquecer item', b.id, e);
      return null;                        // ← fallback
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean) as CartItemDTO[];   // remove nulls
}
