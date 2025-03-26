'use client';

import React, { use, useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocationContext } from '@/context/LocationContext';
import {
  getProductByIdWithDelivery,
  listVariationImagesByVariation,
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

import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import Card from '@/components/UI/Card/Card';
import shareIcon from '../../../../public/assets/share.svg';
import chatIcon from '../../../../public/assets/chat.svg';
import followIcon from '../../../../public/assets/follow.svg';

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
import styles from './Product.module.css';

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

/**
 * Optional props:
 *   - imageSrc?: allows us to pass an icon or image
 *   - onClick?: function for any click handler
 */
interface StageButtonProps {
  text: string;
  backgroundColor: string;
  imageSrc?: any;
  onClick?: () => Promise<void>;
}

const ProductPage: React.FC<ProductPageProps> = ({ params }) => {
  // ----------------------------------------------------------------------------
  // 1. HOOKS AT THE TOP-LEVEL
  const resolvedParams = use(params);
  const { id } = resolvedParams; // params is a Promise in Next 13

  const { location } = useLocationContext();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryPriceDTO | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupActiveDetailsDTO | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Store the images for each variation
  const [variationImagesMap, setVariationImagesMap] = useState<
    Record<string, VariationImageDTO[]>
  >({});

  // Controls the currently selected variation (by attributes)
  const [selectedVariation, setSelectedVariation] = useState<
    ProductVariationDTO | null
  >(null);

  // Store the selected attribute values
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(
    {}
  );

  // Gallery of images from the main product + all variations
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Currently displayed main image
  const [mainImage, setMainImage] = useState<string>('');

  // Channel data
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';

  const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // ----------------------------------------------------------------------------
  // FETCH: Product (with delivery data)
  useEffect(() => {
    if (!id || !location) return;
    setLoading(true);
    getProductByIdWithDelivery(id, location.latitude, location.longitude)
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        console.error(err);
        setError('Erro ao carregar o produto.');
      })
      .finally(() => setLoading(false));
  }, [id, location]);

  // ----------------------------------------------------------------------------
  // FETCH: Channel data (by nickname)
  useEffect(() => {
    if (!nickname) return;

    const fetchChannelData = async () => {
      try {
        const formattedNickname = nickname.startsWith('@')
          ? nickname.slice(1)
          : nickname;

        const channel = await getChannelByNickname(formattedNickname);
        if (!channel) {
          console.error('Canal não encontrado!');
          return;
        }

        setChannelData({
          ...channel,
          imageUrl: channel.imageUrl || '',
        });

        const following = await isFollowing(channel.id);
        setIsFollowingChannel(following);

        const ownerCheck = await isChannelOwner(channel.id);
        setIsOwner(ownerCheck);
      } catch (error) {
        console.error('Erro ao buscar dados do canal:', error);
      }
    };

    fetchChannelData();
  }, [nickname]);

  // ----------------------------------------------------------------------------
  // FETCH: Variation images
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

  // ----------------------------------------------------------------------------
  // Auto-select the first variation if the product has variations
  useEffect(() => {
    if (!product) return;
    // If the product has variations and we haven't selected anything yet:
    if (product.variations && product.variations.length > 0) {
      // Take the first variation
      const firstVar = product.variations[0];
      // Create an attributes object
      const newSelectedAttributes: Record<string, string> = {};
      firstVar.attributes.forEach((attr) => {
        if (attr.attributeName && attr.attributeValue) {
          newSelectedAttributes[attr.attributeName] = attr.attributeValue;
        }
      });
      setSelectedAttributes(newSelectedAttributes);
    }
  }, [product]);

  // Build an attribute map for display
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

  // Handle attribute clicks
  const handleAttributeClick = (attrName: string, attrValue: string) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attrName]: attrValue,
    }));
  };

  // Find the matching variation for the selected attributes
  function getMatchingVariation(): ProductVariationDTO | null {
    if (!product || !product.variations?.length) return null;

    const selectedPairs = Object.entries(selectedAttributes);
    if (selectedPairs.length === 0) {
      return null;
    }

    return (
      product.variations.find((variation) => {
        return selectedPairs.every(([name, value]) =>
          variation.attributes.some(
            (attr) =>
              attr.attributeName === name && attr.attributeValue === value
          )
        );
      }) || null
    );
  }

  // Whenever selectedAttributes changes, try to find the corresponding variation
  useEffect(() => {
    const matchedVariation = getMatchingVariation();
    setSelectedVariation(matchedVariation || null);
  }, [selectedAttributes, product]);

  // ----------------------------------------------------------------------------
  // Build the image gallery
  const activeThumbnailRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!product) return;

    let combined: string[] = [];

    // 1. Images from the selected variation (if any)
    if (selectedVariation) {
      const selVarImages = variationImagesMap[selectedVariation.id!] || [];
      combined.push(...selVarImages.map((img) => img.imageUrl));
    }

    // 2. Images from all variations
    if (product.variations?.length) {
      Object.values(variationImagesMap).forEach((imgArr) => {
        imgArr.forEach((img) => {
          combined.push(img.imageUrl);
        });
      });
    }

    // 3. Images from the main product
    if (product.images?.length) {
      combined.push(...product.images);
    }

    // 4. Remove duplicates
    combined = Array.from(new Set(combined));

    setGalleryImages(combined);

    // 5. Pick the first one as the mainImage
    if (combined.length > 0) {
      setMainImage(combined[0]);
    } else {
      setMainImage('');
    }
  }, [product, selectedVariation, variationImagesMap]);

  // Scroll to the active thumbnail
  useEffect(() => {
    if (activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
      });
    }
  }, [mainImage]);

  // ----------------------------------------------------------------------------
  // FETCH: Delivery price
  useEffect(() => {
    if (product && location) {
      getDeliveryPrice(product.catalogId, location.latitude, location.longitude)
        .then((data) => {
          setDeliveryData(data);
        })
        .catch((err) => {
          console.error('Erro ao carregar preço de entrega:', err);
          setDeliveryData(null);
        });
    }
  }, [product, location]);

  // FETCH: Pickup details
  useEffect(() => {
    if (!product) return;
    getActivePickupDetailsByCatalogId(product.catalogId)
      .then((data) => {
        setPickupDetails(data);
      })
      .catch((err) => {
        console.error('Erro ao carregar dados de retirada:', err);
        setPickupDetails(null);
      });
  }, [product]);

  // ----------------------------------------------------------------------------
  // ACTIONS: follow, unfollow, message
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

  // ----------------------------------------------------------------------------
  // LOADING / ERROR STATES
  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Nenhum produto encontrado.</p>;
  if (!channelData) return <div>Carregando canal...</div>;

  // ----------------------------------------------------------------------------
  // CHANNEL BUTTONS
  const formattedNickname = nickname.startsWith('@')
    ? nickname.slice(1)
    : nickname;

  // We define stageButtons so that each item can optionally have imageSrc or onClick
  const stageButtons: StageButtonProps[] = isOwner
    ? [
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
        },
      ]
    : isFollowingChannel
    ? [
        {
          text: 'Amigos',
          backgroundColor: '#212121',
          onClick: handleUnfollowClick,
        },
      ]
    : [
        {
          text: 'Seguir',
          backgroundColor: '#DF1414',
          imageSrc: followIcon,
          onClick: handleFollowClick,
        },
      ];

  // ----------------------------------------------------------------------------
  // PRODUCT PRICE DISPLAY
  const baseName = product.name;
  const basePrice = product.salePrice;
  const baseDiscount = product.discountPrice;

  // If there’s a selected variation, use its name/price
  const variationName = selectedVariation?.name;
  const variationPrice = selectedVariation?.price;
  const variationDiscount = selectedVariation?.discountPrice;

  const displayName = variationName || baseName;
  const displayPrice = variationPrice ?? basePrice;
  const displayDiscount = variationDiscount ?? baseDiscount;

  // ----------------------------------------------------------------------------
  // RENDER
  return (
    <div className={styles.productPage}>
      <div className={styles.leftColumn}>
        <div className={styles.productConteiner}>
          {/* CHANNEL HEADER */}
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
                    onClick={() => {
                      window.location.href = `${frontUrl}${formattedNickname}`;
                    }}
                  >
                    <h2 className={styles.channelName}>{channelData.name}</h2>
                    <p className={styles.channelNickname}>{nickname}</p>
                  </div>
                </div>
                <div className={styles.channelFollow}>
                  {stageButtons
                    .filter(
                      (btn) => btn.text === 'Seguir' || btn.text === 'Amigos'
                    )
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

            {/* PRODUCT GALLERY */}
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
                  <Image
                    src={defaultImage}
                    alt="Imagem padrão"
                    width={419}
                    height={419}
                  />
                )}
              </div>

              {/* Thumbnails */}
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

          {/* MAIN PRODUCT SECTION */}
          <div className={styles.productSection}>
            <div className={styles.name}>
              <span>{displayName}</span>
            </div>

            {/* Price Section */}
            <div className={styles.priceSection}>
              {displayDiscount && displayDiscount > 0 && (
                <span className={styles.originalPrice}>
                  {(() => {
                    const discountValue = Number(displayDiscount || 0);
                    const salePriceValue = Number(displayPrice || 0);
                    // Example of calculating the original price from discount
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

            {/* Attributes (variation) */}
            {product.variations && product.variations.length > 0 && (
              <div style={{ margin: '1rem 0' }}>
                {[...attributesMap.entries()].map(([attrName, values]) => (
                  <div key={attrName} style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {attrName}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {[...values].map((val) => (
                        <button
                          key={val}
                          onClick={() => handleAttributeClick(attrName, val)}
                          style={{
                            padding: '0.5rem 1rem',
                            border: '1px solid #ccc',
                            cursor: 'pointer',
                            borderColor:
                              selectedAttributes[attrName] === val
                                ? '#7B33E5'
                                : '#fff',
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

            <Card title="Opiniões do produto">
              <div>
                <span>4.7</span>
              </div>
            </Card>
          </div>
        </div>

        <div className={styles.infoConteiner}>
          <ExpandableCard title="Informações do produto">
            <p>Aqui</p>
          </ExpandableCard>
          <ExpandableCard title="Mais detalhes">
            <p>Aqui</p>
          </ExpandableCard>
        </div>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.deliveries}>
          <Card title="Delivery">
            <div>
              <span>{deliveryData ? `R$ ${deliveryData.price}` : 'N/A'}</span>
              <span>
                {deliveryData ? `${deliveryData.averageDeliveryTime} min` : 'N/A'}
              </span>
            </div>
          </Card>
          <Card title="Retirada">
            <div>
              {pickupDetails && (
                <div>
                  <h2>Opção de Retirada</h2>
                  <p>
                    <strong>Preço de Retirada:</strong>{' '}
                    {pickupDetails.precoRetirada === 0
                      ? 'Grátis'
                      : pickupDetails.precoRetirada}
                  </p>
                  <p>
                    <strong>Prazo de Retirada:</strong>{' '}
                    {pickupDetails.prazoRetirada} dias
                  </p>
                  <h3>Endereço do Catálogo</h3>
                  <ul>
                    <li>
                      <strong>Destinatário:</strong>{' '}
                      {pickupDetails.address.recipientName}
                    </li>
                    <li>
                      <strong>Telefone:</strong>{' '}
                      {pickupDetails.address.recipientPhone}
                    </li>
                    <li>
                      <strong>CEP:</strong> {pickupDetails.address.cep}
                    </li>
                    <li>
                      <strong>Estado:</strong> {pickupDetails.address.state}
                    </li>
                    <li>
                      <strong>Cidade:</strong> {pickupDetails.address.city}
                    </li>
                    <li>
                      <strong>Bairro:</strong> {pickupDetails.address.neighborhood}
                    </li>
                    <li>
                      <strong>Rua:</strong> {pickupDetails.address.street}
                    </li>
                    <li>
                      <strong>Número:</strong> {pickupDetails.address.number}
                    </li>
                    {pickupDetails.address.complement && (
                      <li>
                        <strong>Complemento:</strong>{' '}
                        {pickupDetails.address.complement}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
