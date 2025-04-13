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
import { DeliveryPriceDTO } from '@/types/services/delivery';
import { PickupActiveDetailsDTO } from '@/types/services/pickup';
import StageButton from '@/components/UI/StageButton/StageButton';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import ProductRating from '@/components/UI/ProductRating/ProductRating';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import Card from '@/components/UI/Card/Card';
import ProductCard from '@/components/UI/ProductCard/ProductCard';
import shareIcon from '../../../../public/assets/share.svg';
import followIcon from '../../../../public/assets/follow.svg';
import likesIcon from '../../../../public/assets/likes.svg';
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
import { startConversation } from '@/services/chatService';
import defaultImage from '../../../../public/assets/user.png';
import Modal from '@/components/Modals/Modal/Modal';

import {
  listFavoriteFolders,
  likeProduct as favoriteProduct,
  removeProductLike,
} from '@/services/favoriteService';

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

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryPriceDTO | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupActiveDetailsDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullAddress, setShowFullAddress] = useState(false);
  const [variationImagesMap, setVariationImagesMap] = useState<Record<string, VariationImageDTO[]>>({});

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
  const [favoriteFolders, setFavoriteFolders] = useState<any[]>([]);
  const [newFolderName, setNewFolderName] = useState<string>('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';

  const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  const activeThumbnailRef = useRef<HTMLDivElement | null>(null);

  // ----------------------------------------------------------------------------
  // FETCHES
  useEffect(() => {
    if (!id || !location) return;
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
    (async () => {
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
    })();
  }, [product]);

  useEffect(() => {
    if (!product) return;
    if (product.variations && product.variations.length > 0) {
      const firstVar = product.variations[0];
      const newSelectedAttributes: Record<string, string> = {};
      firstVar.attributes.forEach((attr) => {
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
    if (!channelData) return;
    try {
      await followChannel(channelData.id);
      setIsFollowingChannel(true);
    } catch (error) {
      console.error('Erro ao seguir o canal:', error);
    }
  }, [channelData]);

  const handleUnfollowClick = useCallback(async () => {
    if (!channelData) return;
    try {
      await unfollowChannel(channelData.id);
      setIsFollowingChannel(false);
    } catch (error) {
      console.error('Erro ao deixar de seguir o canal:', error);
    }
  }, [channelData]);

  const handleMessageClick = useCallback(async () => {
    if (!channelData) return;
    const authResponse = await checkAuth();
    if (!authResponse.isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      const conversationId = await startConversation(channelData.id, '');
      if (!conversationId || typeof conversationId !== 'string') {
        console.error('Conversa inválida:', conversationId);
        return;
      }
      router.push(`/chat?conversationId=${conversationId}`);
    } catch (error) {
      console.error('Erro ao iniciar conversa:', error);
    }
  }, [channelData, router]);

  // FAVORITOS: verificar se o produto já está na pasta "todos"
  useEffect(() => {
    (async () => {
      try {
        const authRes = await checkAuth();
        if (!authRes.isAuthenticated || !product) return;
        const folders = await listFavoriteFolders();
        setFavoriteFolders(folders || []);
        const todosFolder = folders.find((f) => f.name === 'todos');
        if (todosFolder && todosFolder.productIds.includes(product.id!)) {
          setIsFavorited(true);
        }
      } catch (error) {
        console.error('Erro ao verificar favoritos:', error);
      }
    })();
  }, [product]);

  // Computa as pastas que já possuem o produto
  const currentFolders = favoriteFolders.filter((folder) =>
    folder.productIds.includes(product?.id)
  );

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
      } else {
        // Se já favoritado, abre a modal para gerenciar (exibir onde está e permitir descurtir ou alterar pasta)
        setShowLikeModal(true);
      }
    } catch (error) {
      console.error('Erro ao curtir o produto:', error);
    }
  };

  // FUNÇÃO: Descurtir – remover o produto da pasta atual (por exemplo, da "todos")
  const handleUnlike = async () => {
    if (!product) return;
    if (currentFolders.length === 0) return;
    try {
      // Remove do primeiro folder onde foi salvo
      await removeProductLike(product.id!, currentFolders[0].name);
      alert(`Produto removido da pasta "${currentFolders[0].name}"`);
      setIsFavorited(false);
      const folders = await listFavoriteFolders();
      setFavoriteFolders(folders || []);
      setShowLikeModal(false);
    } catch (error) {
      console.error('Erro ao descurtir o produto:', error);
    }
  };

  // MODAL: Criar nova pasta e salvar
  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !product) return;
    try {
      await favoriteProduct(product.id!, newFolderName.trim());
      alert(`Produto salvo na pasta "${newFolderName}".`);
      setNewFolderName('');
      setShowLikeModal(false);
      const folders = await listFavoriteFolders();
      setFavoriteFolders(folders || []);
    } catch (error) {
      console.error('Erro ao criar pasta e salvar produto:', error);
    }
  };

  // MODAL: Adicionar a uma pasta existente
  const handleAddToExistingFolder = async (folderName: string) => {
    if (!product) return;
    try {
      await favoriteProduct(product.id!, folderName);
      alert(`Produto salvo na pasta "${folderName}"`);
      setShowLikeModal(false);
      const folders = await listFavoriteFolders();
      setFavoriteFolders(folders || []);
    } catch (error) {
      console.error('Erro ao salvar em pasta existente:', error);
    }
  };

  // ----------------------------------------------------------------------------
  // ADICIONAR AO CARRINHO
  const handleAddToCart = () => {
    const currentId = selectedVariation?.id ?? product?.id;
    const currentStock = selectedVariation?.stock ?? product?.stock ?? 0;
    if (!currentId || currentStock <= 0) {
      alert('Produto indisponível no momento.');
      return;
    }
    const existingItem = bag.find((item) => item.id === currentId);
    const existingQty = existingItem?.quantity ?? 0;
    const desiredQty = existingQty + 1;
    if (desiredQty > currentStock) {
      alert(`Você só pode adicionar até ${currentStock} unidades deste item.`);
      return;
    }
    addToBag({ id: currentId, quantity: 1, nickname });
  };

  // ----------------------------------------------------------------------------
  // RENDER
  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Nenhum produto encontrado.</p>;
  if (!channelData) return <div>Carregando canal...</div>;

  const formattedNickname = nickname.startsWith('@') ? nickname.slice(1) : nickname;
  const stageButtons: StageButtonProps[] = isOwner
    ? [{ text: 'Compartilhar', backgroundColor: '#212121', imageSrc: shareIcon }]
    : isFollowingChannel
    ? [{ text: 'Amigos', backgroundColor: '#212121', onClick: handleUnfollowClick }]
    : [{ text: 'Seguir', backgroundColor: '#DF1414', imageSrc: followIcon, onClick: handleFollowClick }];

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

  return (
    <>
      <MobileHeader
        title="Produto"
        buttons={{ close: true, bag: true, address: true, share: true }}
        handleBack={handleBack}
      />

      <div className={styles.productPage}>
        {/* COLUNA ESQUERDA */}
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
                      <div style={{ fontWeight: 'bold', marginBottom: '0.4rem' }}>{attrName}</div>
                      <div className={styles.variationButtons}>
                        {[...values].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleAttributeClick(attrName, val);
                            }}
                            className={styles.variationButton}
                            style={{
                              borderStyle: selectedAttributes[attrName] === val ? 'dashed' : 'solid',
                              borderColor: selectedAttributes[attrName] === val ? '#7B33E5' : '#fff',
                            }}
                          >
                            {val}
                          </button>
                        ))}
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
                  <Image src={likesIcon} alt="Likes" width={24} height={24} />
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
                    <strong className={styles.highlight}>Devolução grátis.</strong> Você tem 30 dias a partir da data de recebimento.
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <Image src={checkBuyIcon} alt="Ícone de garantia" width={24} height={24} />
                  <span>
                    <strong className={styles.highlight}>Compra Garantida.</strong> Receba o produto que está esperando ou devolvemos o dinheiro.
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
                      {pickupDetails.precoRetirada === 0 ? 'Grátis' : pickupDetails.precoRetirada}
                    </div>
                    <div className={styles.availability}>
                      em {pickupDetails.prazoRetirada} dias
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
          <div className={styles.infoContainer}>
            <div className={styles.infoItem}>
              <Image src={reabastecerIcon} alt="Ícone de devolução" width={24} height={24} />
              <span>
                <strong className={styles.highlight}>Devolução grátis.</strong> Você tem 30 dias a partir da data de recebimento.
              </span>
            </div>
            <div className={styles.infoItem}>
              <Image src={checkBuyIcon} alt="Ícone de garantia" width={24} height={24} />
              <span>
                <strong className={styles.highlight}>Compra Garantida.</strong> Receba o produto que está esperando ou devolvemos o dinheiro.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE LIKE – com cabeçalho, corpo e rodapé */}
      <Modal isOpen={showLikeModal} onClose={() => setShowLikeModal(false)}>
        <div className={styles.modalHeader}>
          <div className={styles.modalIcon}>
            <Image src={likesIcon} alt="Likes" width={24} height={24} />
          </div>
          {currentFolders.length > 0 && (
            <div className={styles.savedInfo}>
              <span>Produto salvo em:&nbsp;</span>
              {currentFolders.map((folder) => (
                <span key={folder.id} className={styles.folderName}>
                  {folder.name}
                </span>
              ))}
            </div>
          )}
          <button className={styles.unlikeButton} onClick={handleUnlike}>
            Descurtir
          </button>
        </div>
        <div className={styles.modalBody}>
          <h3>Escolha outra pasta para salvar:</h3>
          <ul className={styles.folderList}>
            {favoriteFolders.map((folder) => (
              <li
                key={folder.id}
                className={styles.folderItem}
                onClick={() => handleAddToExistingFolder(folder.name)}
              >
                {folder.name}
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
