'use client';

import React, { use, useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocationContext } from '@/context/LocationContext';
import { useBag } from '@/context/BagContext';
import {
  getProductByIdWithDelivery,
  listVariationImagesByVariation,
  getProductsByCatalogAndSubcategoryWithDelivery,
} from '@/services/product/productService';
import { getDeliveryPrice } from '@/services/deliveryService';
import { getActivePickupDetailsByCatalogId } from '@/services/pickupService';
import {
  ProductDTO,
  VariationImageDTO,
  ProductVariationDTO,
} from '@/types/services/product';
import {
  FavoriteFolderDTO,
  FavoriteStatusDTO
} from '@/types/services/favorites';
import { DeliveryPriceDTO } from '@/types/services/delivery';
import { PickupActiveDetailsDTO } from '@/types/services/pickup';
import StageButton from '@/components/UI/StageButton/StageButton';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import ProductRating from '@/components/UI/ProductRating/ProductRating';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import { LikeIcon } from '@/components/icons/LikeIcon';
import Card from '@/components/UI/Card/Card';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import shareIcon from '../../../../public/assets/share.svg';
import followIcon from '../../../../public/assets/follow.svg';
import purchaseEventIcon from '../../../../public/assets/purchaseEventChannel.svg';
import checkBuyIcon from '../../../../public/assets/checkBuy.svg';
import reabastecerIcon from '../../../../public/assets/reabastecer.svg';
import {
  getChannelByNickname,
  isChannelOwner,
} from '@/services/channel/channelService';
import {
  followChannel,
  unfollowChannel,
  isFollowing,
} from '@/services/channel/followService';
import { checkAuth } from '@/services/authService';
import defaultImage from '../../../../public/assets/user.png';
import Modal from '@/components/Modals/Modal/Modal';

import {
  listFavoriteFolders,
  getFavoriteStatus, 
  likeProduct as favoriteProduct,
  removeProductLike,
} from '@/services/favoriteService';

// Hook de notificações
import { useNotification } from '@/hooks/useNotification';

import styles from './Product.module.css';

// Tipos locais
interface ProductPageProps {
  params: Promise<{ id: string }>;
}

interface ChannelData {
  id: string;
  name: string;
  imageUrl: string;
  about?: any;
  faqs?: FAQData[];
}

interface FAQData {
  question: string;
  answer: string;
}

interface StageButtonProps {
  text: string;
  backgroundColor: string;
  imageSrc?: any;
  onClick?: () => Promise<void>;
}

const ProductPage: React.FC<ProductPageProps> = ({ params }) => {
  // ----------------------------------------------------------------------------
  // HOOKS E ESTADOS
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const { location } = useLocationContext();
  const { bag, addToBag } = useBag();
  const [followLoading, setFollowLoading] = useState(false);
  const [folderMembership, setFolderMembership] = useState<Record<string, boolean>>({});
  const [favoriteStatus, setFavoriteStatus]   = useState<FavoriteStatusDTO | null>(null);

  // Uso do hook de notificações
  const { setMessage } = useNotification();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryPriceDTO | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupActiveDetailsDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [variationImagesMap, setVariationImagesMap] = useState<Record<string, VariationImageDTO[]>>(
    {}
  );

  // Variação e atributos
  const [selectedVariation, setSelectedVariation] = useState<ProductVariationDTO | null>(null);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

  // Galeria de imagens
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [mainImage, setMainImage] = useState<string>('');

  // Dados do canal
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Produtos relacionados
  const [relatedProducts, setRelatedProducts] = useState<ProductDTO[]>([]);
  const [relatedLoading, setRelatedLoading] = useState<boolean>(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  // Favoritos
  const [isFavorited, setIsFavorited] = useState(false);
  const [showLikeModal, setShowLikeModal] = useState(false);
  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolderDTO[]>([]);

  const [newFolderName, setNewFolderName] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';

  const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const activeThumbnailRef = useRef<HTMLDivElement | null>(null);


  const [auth, setAuth] = useState<{ isAuthenticated: boolean } | null>(null);

  useEffect(() => {
    checkAuth()
      .then(setAuth)
      .catch(() => setAuth({ isAuthenticated: false }));
  }, []);

  // ----------------------------------------------------------------------------
  // FETCHES
  useEffect(() => {
    if (!id || !location || location.latitude === 0 || location.longitude === 0) return;

    setLoading(true);
    getProductByIdWithDelivery(id, location.latitude, location.longitude)
      .then(setProduct)
      .catch((err) => {
        console.error(err);
        setError('Erro ao carregar o produto.');
      })
      .finally(() => setLoading(false));
  }, [id, location]);

  useEffect(() => {
    if (!nickname) return;
    (async () => {
      try {
        const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;
        const channel = await getChannelByNickname(formattedNickname);
        if (!channel) {
          console.error('Canal não encontrado!');
          return;
        }
        setChannelData({ ...channel, imageUrl: channel.imageUrl || '' });
        setIsFollowingChannel(await isFollowing(channel.id));
        setIsOwner(await isChannelOwner(channel.id));
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
      }
    })();
  }, [nickname]);

  useEffect(() => {
    if (!product?.variations?.length) return;
  
    // Busca a primeira variação cuja propriedade "active" seja exatamente true
    const firstActiveVar = product.variations.find((v) => v.active === true);
    console.log("Variação ativa encontrada:", firstActiveVar); // Debug: verifique no console
  
    if (firstActiveVar) {
      const newSelectedAttributes: Record<string, string> = {};
      firstActiveVar.attributes.forEach((attr) => {
        if (attr.attributeName && attr.attributeValue) {
          newSelectedAttributes[attr.attributeName] = attr.attributeValue;
        }
      });
      setSelectedAttributes(newSelectedAttributes);
    }
  }, [product]);

  const attributesMap = new Map<string, Set<string>>();
  if (product?.variations && product.variations.length > 0) {
    product.variations.forEach((variation) => {
      variation.attributes.forEach((attr) => {
        if (!attr.attributeName || !attr.attributeValue) return;
        if (!attributesMap.has(attr.attributeName)) {
          attributesMap.set(attr.attributeName, new Set());
        }
        attributesMap.get(attr.attributeName)!.add(attr.attributeValue);
      });
    });
  }

  const handleAttributeClick = (attrName: string, attrValue: string) => {
    setSelectedAttributes((prev) => ({ ...prev, [attrName]: attrValue }));
  };

  function getMatchingVariation(): ProductVariationDTO | null {
    if (!product || !product.variations?.length) return null;
    const selectedPairs = Object.entries(selectedAttributes);
    if (selectedPairs.length === 0) return null;
    return (
      product.variations.find((variation) =>
        selectedPairs.every(([name, value]) =>
          variation.attributes.some(
            (attr) => attr.attributeName === name && attr.attributeValue === value
          )
        )
      ) || null
    );
  }


  
  useEffect(() => {
    const matchedVariation = getMatchingVariation();
    setSelectedVariation(matchedVariation || null);
  }, [selectedAttributes, product]);

  useEffect(() => {
    const fetchVariationImages = async () => {
      if (!product?.variations?.length) return;

      try {
        const variationImagePromises = product.variations.map(async (variation) => {
          const images = await listVariationImagesByVariation(variation.id!);
          return { variationId: variation.id!, images };
        });

        const results = await Promise.all(variationImagePromises);
        const mapResult = results.reduce((acc, { variationId, images }) => {
          acc[variationId] = images;
          return acc;
        }, {} as Record<string, VariationImageDTO[]>);

        setVariationImagesMap(mapResult);
      } catch (err) {
        console.error('Erro ao carregar imagens de variação:', err);
      }
    };

    fetchVariationImages();
  }, [product]);
  
  useEffect(() => {
    if (!product) return;
    let combined: string[] = [];
    if (selectedVariation) {
      const selVarImages = variationImagesMap[selectedVariation.id!] || [];
      combined.push(...selVarImages.map((img) => img.imageUrl));
    }
    if (product.variations?.length) {
      Object.values(variationImagesMap).forEach((imgArr) => {
        imgArr.forEach((img) => combined.push(img.imageUrl));
      });
    }
    if (product.images?.length) {
      combined.push(...product.images);
    }
    combined = Array.from(new Set(combined));
    setGalleryImages(combined);
    setMainImage(combined[0] || '');
  }, [product, selectedVariation, variationImagesMap]);

  useEffect(() => {
    if (!mainImage || !galleryImages.includes(mainImage)) return;
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [mainImage, galleryImages]);

  useEffect(() => {
    if (product && location) {
      getDeliveryPrice(product.catalogId, location.latitude, location.longitude)
        .then(setDeliveryData)
        .catch((err) => {
          console.error('Erro ao carregar preço de entrega:', err);
          setDeliveryData(null);
        });
    }
  }, [product, location]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (!product) return;
    getActivePickupDetailsByCatalogId(product.catalogId)
      .then(setPickupDetails)
      .catch((err) => {
        console.error('Erro ao carregar dados de retirada:', err);
        setPickupDetails(null);
      });
  }, [product]);

  useEffect(() => {
    if (!product || !location) return;
    if (!product.subCategoryId) {
      setRelatedProducts([]);
      return;
    }
    setRelatedLoading(true);
    getProductsByCatalogAndSubcategoryWithDelivery(
      product.catalogId,
      product.subCategoryId,
      location.latitude,
      location.longitude,
      0,
      10
    )
      .then((response) => setRelatedProducts(response.content))
      .catch((error) => {
        console.error('Erro ao buscar produtos relacionados:', error);
        setRelatedError('Erro ao carregar produtos relacionados.');
      })
      .finally(() => setRelatedLoading(false));
  }, [product, location]);

  // Ações: seguir, deixar de seguir, mensagem
  const handleFollowClick = useCallback(async () => {
  if (!channelData || followLoading) return;

  setFollowLoading(true);
  try {
    await followChannel(channelData.id);
    setIsFollowingChannel(true);
    setMessage('Canal seguido com sucesso!', 'success');
  } catch (error: any) {
    console.error('Erro ao seguir o canal:', error);
    // se der 401/403 no followChannel, talvez o token tenha expirado
    if (error.response?.status === 401 || error.response?.status === 403) {
      router.push('/login');
      return; 
    }
    setMessage('Não foi possível seguir o canal. Tente novamente.', 'error');
  } finally {
    setFollowLoading(false);
  }
}, [channelData, followLoading, router, setMessage]);


  const handleUnfollowClick = useCallback(async () => {
    if (!channelData) return;
    try {
      await unfollowChannel(channelData.id);
      setIsFollowingChannel(false);
      setMessage('Você deixou de seguir o canal.', 'success');
    } catch (error) {
      console.error('Erro ao deixar de seguir o canal:', error);
      setMessage('Erro ao deixar de seguir o canal!', 'error');
    }
  }, [channelData, setMessage]);

  // no lugar do useEffect atual de FAVORITOS
  useEffect(() => {
    if (!product) return;
  
    (async () => {
      try {
        const authRes = await checkAuth();
        if (!authRes.isAuthenticated) return;
  
        // 1) status rápido do produto
        const status = await getFavoriteStatus(product.id!);
        setFavoriteStatus(status);
        setIsFavorited(status.favorited);
        setFolderMembership(
          Object.fromEntries(status.folders.map((n) => [n, true]))
        );
  
        // 2) lista (para exibir todas as pastas no modal)
        const { data: folders } = await listFavoriteFolders();
        setFavoriteFolders(folders);    // ← agora folders é FavoriteFolderDTO[]
      } catch (err) {
        console.error('Erro ao verificar favoritos:', err);
      }
    })();
  }, [product, showLikeModal]);
  
  


  // Computa as pastas que já possuem o produto
  const currentFolders = favoriteStatus?.folders ?? [];
  
  // FUNÇÃO: Clicar no botão de like
  const handleLikeClick = async () => {
    try {
      const authRes = await checkAuth();
      if (!authRes.isAuthenticated) {
        router.push('/login');
        return;
      }
      if (!product) return;
      if (!isFavorited) {
        await favoriteProduct(product.id!, undefined);
        setIsFavorited(true);
        setMessage('Produto favoritado com sucesso!', 'success');
      } else {
        // Se já favoritado, abre a modal para gerenciar
        setShowLikeModal(true);
      }
    } catch (error) {
      console.error('Erro ao curtir o produto:', error);
      setMessage('Erro ao favoritar o produto!', 'error');
    }
  };

  // FUNÇÃO: Descurtir – remover o produto da pasta atual (por exemplo, da "todos")
  const handleUnlike = async () => {
    if (!product) return;
    if (currentFolders.length === 0) return;
    try {
      // Remove do primeiro folder onde foi salvo
      const folderName = currentFolders[0];
      await removeProductLike(product.id!, folderName);
      setMessage(`Produto removido da pasta "${folderName}"`, 'success');
  
      setIsFavorited(false);
      const { data: folders } = await listFavoriteFolders();
      setFavoriteFolders(folders);    // ← corrige o tipo
      setShowLikeModal(false);
    } catch (error) {
      console.error('Erro ao descurtir o produto:', error);
      setMessage('Erro ao remover produto dos favoritos!', 'error');
    }
  };

  // MODAL: Criar nova pasta e salvar
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !product) return;
    try {
      await favoriteProduct(product.id!, newFolderName.trim());
      setMessage(`Produto salvo na pasta "${newFolderName}".`, 'success');
      setNewFolderName('');
      setShowLikeModal(false);
      const { data: folders } = await listFavoriteFolders();
      setFavoriteFolders(folders);    // ← agora correto
    } catch (error) {
      console.error('Erro ao criar pasta e salvar produto:', error);
      setMessage('Erro ao criar pasta e salvar produto!', 'error');
    }
  };

  // MODAL: Adicionar ou remover de uma pasta existente
const handleAddToExistingFolder = async (folderName: string) => {
  if (!product) return;

  try {
    const isAlreadySaved = !!folderMembership[folderName];

    if (isAlreadySaved) {
      // 👉 já está na pasta → remover
      await removeProductLike(product.id!, folderName);
      setMessage(`Produto removido da pasta "${folderName}"`, 'success');
    } else {
      // 👉 não está na pasta → adicionar
      await favoriteProduct(product.id!, folderName);
      setMessage(`Produto salvo na pasta "${folderName}"`, 'success');
    }

    /* ---------- atualiza estado local ---------- */
    setFolderMembership((prev) => ({
      ...prev,
      [folderName]: !isAlreadySaved,
    }));
    // atualiza flag geral
    setIsFavorited((prev) =>
      isAlreadySaved ?                    // acabou de remover
        Object.values({ ...folderMembership, [folderName]: false }).some(Boolean)
        : true                            // acabou de adicionar
    );

    // recarrega lista (opcional – garante consistência)
    const { data: folders } = await listFavoriteFolders();
    setFavoriteFolders(folders);    // ← extrai .data antes
    setShowLikeModal(false);
  } catch (error) {
    console.error('Erro ao alternar pasta de favoritos:', error);
    setMessage('Falha ao atualizar favoritos. Tente novamente.', 'error');
  }
};


  // ----------------------------------------------------------------------------
  // ADICIONAR AO CARRINHO
  const handleAddToCart = () => {
    const currentId     = selectedVariation?.id ?? product?.id;
    const isVar         = !!selectedVariation;
    const currentStock  = selectedVariation?.stock ?? product?.stock ?? 0;
  
    if (!currentId || currentStock <= 0) {
      setMessage("Produto indisponível no momento.", "error");
      return;
    }
  
    const existingItem  = bag.find((i) => i.id === currentId);
    const desiredQty    = (existingItem?.quantity ?? 0) + 1;
  
    if (desiredQty > currentStock) {
      setMessage(`Você só pode adicionar até ${currentStock} unidades deste item.`, "error");
      return;
    }
  
    addToBag({ id: currentId, isVariation: isVar, quantity: 1, nickname });
    setMessage("Item adicionado ao carrinho!", "success");
  };
  

  // ----------------------------------------------------------------------------
  // RENDER
  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Nenhum produto encontrado.</p>;
  if (!channelData) return <div>Carregando canal...</div>;

  const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;
  const stageButtons: StageButtonProps[] = isOwner
  ? [
      {
        text: 'Compartilhar',
        backgroundColor: '#212121',
        imageSrc: shareIcon,
        // (sem onClick – tudo ok)
      },
    ]
  : isFollowingChannel
  ? [
      {
        text: 'Amigos',
        backgroundColor: '#212121',
        onClick: handleUnfollowClick,       // já é async () => Promise<void>
      },
    ]
  : auth === null
  ? [
      {
        text: '…',
        backgroundColor: '#ccc',
        onClick: async () => {},           // agora é Promise<void>
      },
    ]
  : auth.isAuthenticated
  ? [
      {
        text: 'Seguir',
        backgroundColor: '#DF1414',
        imageSrc: followIcon,
        onClick: handleFollowClick,        // já é async () => Promise<void>
        // remova o `disabled` daqui do array e passe direto pro componente,
        // ou adicione `disabled?: boolean` em StageButtonProps
      },
    ]
  : [
      {
        text: 'Seguir',
        backgroundColor: '#DF1414',
        imageSrc: followIcon,
        onClick: async () => {             // async + await faz Promise<void>
          await router.push('/login');
        },
      },
    ]


  const baseName = product.name;
  const basePrice = product.salePrice;
  const baseDiscount = product.discountPrice;
  const variationName = selectedVariation?.name;
  const variationPrice = selectedVariation?.price;
  const variationDiscount = selectedVariation?.discountPrice;
  const displayName = variationName || baseName;
  const displayPrice = variationPrice ?? basePrice;
  const displayDiscount = variationDiscount ?? baseDiscount;
  const addressDetails = pickupDetails?.address
    ? `${pickupDetails.address.street}, ${pickupDetails.address.neighborhood}, ${pickupDetails.address.cep}, ${pickupDetails.address.city}, ${pickupDetails.address.state}${
        pickupDetails.address.complement ? `, ${pickupDetails.address.complement}` : ''
      }`
    : '';
    const deliveryMessage = product?.deliveryMessage;

    
  return (
    <>
      <MobileHeader
        title="Produto"
        buttons={{ close: true, bag: true, address: true, share: true }}
        handleBack={handleBack}
      />      

      <div className={styles.productPage}>

        {deliveryMessage && (
          <div className={styles.deliveryMessageLayout}>
            <div className={styles.deliveryMessageBanner}>
              {deliveryMessage}
            </div>
          </div>
        )}

        {/* COLUNA ESQUERDA */}
        <div className={styles.productPageConteiner}>
          <div className={styles.leftColumn}>
            <div className={styles.productConteiner}>
              <div className={styles.productChannelImageDesc}>
                <div className={styles.channelHeader}>
                  <div className={styles.channelLeft}>
                    <div className={styles.channelTitle}>
                      <Image
                        src={`${apiUrl}${channelData.imageUrl}`}
                        alt={`${channelData.name} - Imagem`}
                        className={styles.channelImage}
                        width={130}
                        height={130}
                      />
                      <div
                        className={styles.channelInfo}
                        onClick={() => (window.location.href = `${frontUrl}${formattedNickname}`)}
                      >
                        <h2 className={styles.channelName}>{channelData.name}</h2>
                        <p className={styles.channelNickname}>{nickname}</p>
                      </div>
                    </div>
                    <div className={styles.channelFollow}>
                      {stageButtons
                        .filter((btn) => btn.text === 'Seguir' || btn.text === 'Amigos')
                        .map((button, index) => (
                          <StageButton
                            key={index}
                            text={button.text}
                            backgroundColor={button.backgroundColor}
                            imageSrc={button.imageSrc}
                            onClick={button.onClick}
                          />
                        ))}
                    </div>
                  </div>
                </div>

                {/* GALERIA */}
                <div className={styles.galleryContainer}>
                  <div className={styles.mainImage}>
                    {mainImage ? (
                      <Image
                        src={`${apiUrl}${mainImage}`}
                        alt={`Imagem principal do ${displayName}`}
                        width={419}
                        height={419}
                      />
                    ) : (
                      <Image src={defaultImage} alt="Imagem padrão" width={419} height={419} />
                    )}
                  </div>
                  <div className={styles.thumbnailList}>
                    {galleryImages.map((imgUrl, index) => {
                      const isActive = imgUrl === mainImage;
                      return (
                        <div
                          key={imgUrl + index}
                          ref={isActive ? activeThumbnailRef : null}
                          className={styles.thumbnailItem}
                          onClick={() => setMainImage(imgUrl)}
                        >
                          <Image
                            src={`${apiUrl}${imgUrl}`}
                            alt={`Miniatura de ${displayName} - ${index + 1}`}
                            width={101}
                            height={101}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.shortDescription}>
                  <span>{product.shortDescription}</span>
                </div>
              </div>

              <div className={styles.productSection}>
                <div className={styles.name}>
                  <span>{displayName}</span>
                </div>
                <div className={styles.priceSection}>
                  {displayDiscount && displayDiscount > 0 && (
                    <span className={styles.originalPrice}>
                      {(() => {
                        const discountValue = Number(displayDiscount || 0);
                        const salePriceValue = Number(displayPrice || 0);
                        const original = salePriceValue / (1 - discountValue / 100);
                        return `R$ ${original.toFixed(2).replace('.', ',')}`;
                      })()}
                    </span>
                  )}
                  <div className={styles.priceSaleSection}>
                    <div className={styles.salePrice}>
                      {(() => {
                        const price = Number(displayPrice || 0);
                        const [reais, centavos] = price.toFixed(2).split('.');
                        return (
                          <>
                            R$ {reais}
                            <sup>{centavos}</sup>
                          </>
                        );
                      })()}
                    </div>
                    <div className={styles.pix}>30% OFF no Pix</div>
                  </div>
                  <div className={styles.otherOptions}>
                    ou <strong>R$ 109</strong> em outros meios <a>Ver mais</a>
                  </div>
                </div>

                {/* VARIAÇÕES */}
                {product.variations && product.variations.length > 0 && (
                  <div className={styles.variationsSection}>
                    {[...attributesMap.entries()].map(([attrName, values]) => (
                      <div key={attrName} className={styles.variationGroup}>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.4rem' }}>
                          {attrName}
                        </div>
                        <div className={styles.variationButtons}>
                          {[...values].map((val) => {
                            // Verifica se existe ALGUMA variação com esse (attrName, val) e active = true
                            const hasActiveVariation = product.variations.some(
                              (variation) =>
                                variation.active === true &&
                                variation.attributes.some(
                                  (attr) =>
                                    attr.attributeName === attrName &&
                                    attr.attributeValue === val
                                )
                            );

                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (hasActiveVariation) {
                                    handleAttributeClick(attrName, val);
                                  }
                                }}
                                className={styles.variationButton}
                                disabled={!hasActiveVariation}
                                style={{
                                  opacity: hasActiveVariation ? 1 : 0.5,
                                  borderStyle:
                                    selectedAttributes[attrName] === val ? 'dashed' : 'solid',
                                  borderColor:
                                    selectedAttributes[attrName] === val ? '#7B33E5' : '#fff',
                                  cursor: hasActiveVariation ? 'pointer' : 'not-allowed',
                                }}
                              >
                                {val}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}


                <div className={styles.toCart}>
                  <StageButton
                    text="Adicionar"
                    backgroundColor="#DF1414"
                    width="auto"
                    onClick={handleAddToCart}
                  />
                  {/* BOTÃO DE LIKE */}
                  <button
                    className={`${styles.toCartButton} ${isFavorited ? styles.liked : ''}`}
                    onClick={handleLikeClick}
                  >
                    <LikeIcon />
                  </button>
                  <button className={styles.toCartButton}>
                    <Image src={purchaseEventIcon} alt="Purchase Event" width={24} height={24} />
                  </button>
                </div>
                <div className={styles.ProductRating}>
                  <Card title="Opiniões do produto">
                    <ProductRating />
                  </Card>
                </div>
              </div>
            </div>

            <div className={styles.infoConteiner}>
              <div className={styles.ProductRatingTwo}>
                <Card title="Opiniões do produto">
                  <ProductRating />
                </Card>
              </div>
              <ExpandableCard title="Informações do produto">
                <div className={styles.productInfoContainer}>
                  <div className={styles.descriptionColumn}>
                    <h3>Descrição Completa</h3>
                    <p>{product.complementaryDescription}</p>
                  </div>
                  <div className={styles.detailsColumn}>
                    <h3>Detalhes</h3>
                    <table className={styles.detailsTable}>
                      <tbody>
                        <tr>
                          <td>Condição</td>
                          <td>{product.condition}</td>
                        </tr>
                        <tr>
                          <td>Categoria</td>
                          <td>{product.category?.name}</td>
                        </tr>
                        <tr>
                          <td>Subcategoria</td>
                          <td>{product.subCategory?.name}</td>
                        </tr>
                        <tr>
                          <td>Marca</td>
                          <td>{product.brand?.name}</td>
                        </tr>
                        <tr>
                          <td>Peso Líquido</td>
                          <td>{product.netWeight}</td>
                        </tr>
                        <tr>
                          <td>Peso Bruto</td>
                          <td>{product.grossWeight}</td>
                        </tr>
                        <tr>
                          <td>Largura</td>
                          <td>{product.width}</td>
                        </tr>
                        <tr>
                          <td>Altura</td>
                          <td>{product.height}</td>
                        </tr>
                        <tr>
                          <td>Profundidade</td>
                          <td>{product.depth}</td>
                        </tr>
                        <tr>
                          <td>Volumes</td>
                          <td>{product.volumes}</td>
                        </tr>
                        <tr>
                          <td>Itens por Caixa</td>
                          <td>{product.itemsPerBox}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </ExpandableCard>

              <ExpandableCard title="Mais detalhes">
                <div className={styles.productInfoContainer}>
                  <div className={styles.descriptionColumn}>
                    <h3>Notes</h3>
                    <p>{product.notes}</p>
                  </div>
                  <div className={styles.detailsColumn}>
                    <h3>Technical Specifications</h3>
                    <table className={styles.detailsTable}>
                      <tbody>
                        {product.technicalSpecifications?.map((spec) => (
                          <tr key={spec.id || spec.title}>
                            <td>{spec.title}</td>
                            <td>{spec.content}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </ExpandableCard>

              <div className={styles.DeliveryColumn}>
                <div className={styles.deliveriesTwo}>
                  <Card title="Delivery">
                    {deliveryData && (
                      <div className={styles.pickupBox}>
                        <div className={styles.labels}>
                          <span>Preço</span>
                          <span>Tempo de Entrega</span>
                        </div>
                        <div className={styles.pickupInfo}>
                          <div className={styles.price}>
                            {deliveryData.price === 0 ? 'Grátis' : `R$ ${deliveryData.price}`}
                          </div>
                          <div className={styles.availability}>
                            {deliveryData.averageDeliveryTime} min
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                  <Card title="Retirada">
                    {pickupDetails && (
                      <div className={styles.pickupBox}>
                        <p className={styles.pickupTitle}>
                          <strong>Retirar em:</strong>{' '}
                          {showFullAddress ? (
                            addressDetails
                          ) : (
                            <span className={styles.truncated}>{pickupDetails.address.street}</span>
                          )}
                          <span
                            className={styles.verMais}
                            onClick={() => setShowFullAddress(!showFullAddress)}
                          >
                            {showFullAddress ? 'ver menos' : 'ver mais'}
                          </span>
                        </p>
                        <div className={styles.labels}>
                          <span>Preço</span>
                          <span>Disponibilidade</span>
                        </div>
                        <div className={styles.pickupInfo}>
                          <div className={styles.price}>
                            {pickupDetails.precoRetirada === 0
                              ? 'Grátis'
                              : pickupDetails.precoRetirada}
                          </div>
                          <div className={styles.availability}>
                            em {pickupDetails.prazoRetirada} dias
                          </div>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
                <div className={styles.infoContainerTwo}>
                  <div className={styles.infoItem}>
                    <Image src={reabastecerIcon} alt="Ícone de devolução" width={24} height={24} />
                    <span>
                      <strong className={styles.highlight}>Devolução grátis.</strong> Você tem 30 dias
                      a partir da data de recebimento.
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <Image src={checkBuyIcon} alt="Ícone de garantia" width={24} height={24} />
                    <span>
                      <strong className={styles.highlight}>Compra Garantida.</strong> Receba o produto
                      que está esperando ou devolvemos o dinheiro.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* PRODUTOS RELACIONADOS */}
            <div className={styles.relatedProductsSection}>
              {relatedLoading ? (
                <p>Carregando produtos relacionados...</p>
              ) : relatedError ? (
                <p>{relatedError}</p>
              ) : relatedProducts.length > 0 ? (
                <div className={styles.relatedProductsContainer}>
                  {relatedProducts.map((relProd) => (
                    <Link
                      key={relProd.id}
                      href={`/product/${relProd.id}?nickname=${nickname}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className={styles.relatedProductItem}>
                        <ProductCard
                          images={
                            relProd.images?.length
                              ? relProd.images.map((img) => `${apiUrl}${img}`)
                              : [defaultImage.src]
                          }
                          name={relProd.name}
                          price={relProd.salePrice}
                          discount={relProd.discountPrice}
                          freeShipping={relProd.freeShipping}
                        />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p>Nenhum produto relacionado encontrado.</p>
              )}
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className={styles.rightColumn}>
            <div className={styles.deliveries}>
              {deliveryData && (
                <Card title="Delivery">
                  {deliveryData && (
                    <div className={styles.pickupBox}>
                      <div className={styles.labels}>
                        <span>Preço</span>
                        <span>Tempo de Entrega</span>
                      </div>
                      <div className={styles.pickupInfo}>
                        <div className={styles.price}>
                          {deliveryData.price === 0 ? 'Grátis' : `R$ ${deliveryData.price}`}
                        </div>
                        <div className={styles.availability}>
                          {deliveryData.averageDeliveryTime} min
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}
              {pickupDetails && (
                <Card title="Retirada">
                  {pickupDetails && (
                    <div className={styles.pickupBox}>
                      <p className={styles.pickupTitle}>
                        <strong>Retirar em:</strong>{' '}
                        {showFullAddress ? (
                          addressDetails
                        ) : (
                          <span className={styles.truncated}>{pickupDetails.address.street}</span>
                        )}
                        <span
                          className={styles.verMais}
                          onClick={() => setShowFullAddress(!showFullAddress)}
                        >
                          {showFullAddress ? 'ver menos' : 'ver mais'}
                        </span>
                      </p>
                      <div className={styles.labels}>
                        <span>Preço</span>
                        <span>Disponibilidade</span>
                      </div>
                      <div className={styles.pickupInfo}>
                        <div className={styles.price}>
                          {pickupDetails.precoRetirada === 0 ? 'Grátis' : pickupDetails.precoRetirada}
                        </div>
                        <div className={styles.availability}>
                          em {pickupDetails.prazoRetirada} dias
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
            <div className={styles.infoContainer}>
              <div className={styles.infoItem}>
                <Image src={reabastecerIcon} alt="Ícone de devolução" width={24} height={24} />
                <span>
                  <strong className={styles.highlight}>Devolução grátis.</strong> Você tem 30 dias a
                  partir da data de recebimento.
                </span>
              </div>
              <div className={styles.infoItem}>
                <Image src={checkBuyIcon} alt="Ícone de garantia" width={24} height={24} />
                <span>
                  <strong className={styles.highlight}>Compra Garantida.</strong> Receba o produto que
                  está esperando ou devolvemos o dinheiro.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE LIKE – com cabeçalho, corpo e rodapé */}
      <Modal isOpen={showLikeModal} onClose={() => setShowLikeModal(false)}>
        <div className={styles.modalHeader}>
          <button className={styles.unlikeButton} onClick={handleUnlike}>
          <div className={`${styles.modalIcon} ${isFavorited ? styles.likedIcon : ''}`}> 
            <LikeIcon />           
            <span>Curtido</span>
          </div>
          </button>
        </div>
        <div className={styles.modalBody}>
          <span>Todas as pastas</span>
          <ul className={styles.folderList}>
            {favoriteFolders.map((folder) => (
              <li
                key={folder.id}
                className={styles.folderItem}
                onClick={() => handleAddToExistingFolder(folder.name)}
              >
                {folder.name}
                {/* Mark current saved folder with "Salvo" */}
                {folderMembership[folder.name] && (
                  <span className={styles.savedMarker}>Salvo</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.modalFooter}>
          <input
            type="text"
            placeholder="Digite o nome da nova pasta"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <button onClick={handleCreateFolder}>Criar nova pasta</button>
        </div>
      </Modal>
    </>
  );
};

export default ProductPage;
