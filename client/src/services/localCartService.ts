import {
  getProductById,
  getProductByIdWithDelivery,
  listVariationImagesByVariation,
} from '@/services/product/productService';
import { BagItem } from '@/context/BagContext';
import { CartItemDTO } from '@/types/services/cart'; // adicione availableStock ao type

/* ---------- util: devolve a 1ª imagem, se houver ---------------- */
const firstImage = (p: any): string | undefined => p.images?.[0];

/* ---------- enriquece 1 BagItem com dados completos ------------- */
async function enrich(
  item: BagItem,
  latitude?: number,
  longitude?: number,
): Promise<CartItemDTO> {
  /* 1 — busca do produto (com ou sem cálculo de entrega) */
  const prod =
    latitude !== undefined && longitude !== undefined
      ? await getProductByIdWithDelivery(
          item.isVariation ? item.productId! : item.id,
          latitude,
          longitude,
        )
      : await getProductById(item.isVariation ? item.productId! : item.id);

  /* 2 — dados base */
  let unitPrice: number | string = prod.salePrice;
  let discountPrice: number | string = prod.discountPrice;
  let attributes: any[] = [];
  let imageUrl = firstImage(prod);
  let stock = prod.stock;                         // estoque default

  if (item.isVariation) {
    const varObj = prod.variations.find((v: any) => v.id === item.id);
    if (varObj) {
      unitPrice     = varObj.price ?? unitPrice;
      discountPrice = varObj.discountPrice ?? discountPrice;
      attributes    = varObj.attributes ?? [];
      stock         = varObj.stock ?? stock;

      // imagem específica da variação
      const imgs = await listVariationImagesByVariation(varObj.id!);
      if (imgs.length) imageUrl = imgs[0].imageUrl;
    }
  }

  /* 3 — normalização de tipos numéricos */
  unitPrice     = Number(unitPrice ?? 0);
  discountPrice = Number(discountPrice ?? 0);
  stock         = Number(stock ?? 0);

  /* 4 — validações extras */
  if (!prod.channel) throw new Error('Produto sem canal: ' + prod.id);

  /* 5 — monta DTO mínimo para a UI */
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
    channel: prod.channel!,
    catalogId: prod.catalogId,
    availableStock: stock,          // ← NOVO campo usado para limitar qty
  };

  return dto;
}

/* ---------- converte toda a Bag local em array pronto pra UI ---- */
export async function buildLocalCart(
  bag: BagItem[],
  lat?: number,
  lon?: number,
): Promise<CartItemDTO[]> {
  const results = await Promise.all(
    bag.map(async (b) => {
      try {
        return await enrich(b, lat, lon);
      } catch (e) {
        console.error('Falha ao enriquecer item', b.id, e);
        return null;                 // falhou? descarta item corrompido
      }
    }),
  );
  return results.filter(Boolean) as CartItemDTO[];
}
