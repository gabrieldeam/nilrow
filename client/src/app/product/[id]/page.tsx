'use client';

import React, { use, useEffect, useState, useCallback } from 'react';
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

interface AboutData {
  aboutText?: string;
  storePolicies?: string;
  exchangesAndReturns?: string;
  additionalInfo?: string;
}

interface FAQData {
  question: string;
  answer: string;
}

const ProductPage: React.FC<ProductPageProps> = ({ params }) => {
  // ----------------------------------------------------------------------------
  // 1. HOOKS AT THE TOP-LEVEL
  const resolvedParams = use(params);
  const { id } = resolvedParams; // params é uma Promise no Next 13

  const { location } = useLocationContext();

  const [product, setProduct] = useState<ProductDTO | null>(null);
  const [deliveryData, setDeliveryData] = useState<DeliveryPriceDTO | null>(null);
  const [pickupDetails, setPickupDetails] = useState<PickupActiveDetailsDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dados para lidar com a variação selecionada
  const [selectedVariation, setSelectedVariation] =
    useState<ProductVariationDTO | null>(null);

  // Mapa de variaçãoId -> array de imagens
  const [variationImagesMap, setVariationImagesMap] = useState<
    Record<string, VariationImageDTO[]>
  >({});

  // Lista de imagens que vão para a galeria (produto + variação se existir)
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  // Imagem que fica em destaque (principal)
  const [mainImage, setMainImage] = useState<string>('');

  // Dados do canal
  const [channelData, setChannelData] = useState<ChannelData | null>(null);
  const [aboutData, setAboutData] = useState<AboutData>({});
  const [faqData, setFaqData] = useState<FAQData[]>([]);
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const nickname = searchParams.get('nickname') || '';

  const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || '';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

  // ----------------------------------------------------------------------------
  // FETCH: Produto (com delivery)
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

  // FETCH: Dados do canal (por apelido)
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

  // FETCH: Imagens de cada variação
  useEffect(() => {
    const fetchVariationImages = async () => {
      if (!product?.variations?.length) return;

      try {
        const variationImagePromises = product.variations.map(async (variation) => {
          const images = await listVariationImagesByVariation(variation.id!);
          return { variationId: variation.id!, images };
        });

        const results = await Promise.all(variationImagePromises);
        const mapResult = results.reduce(
          (acc, { variationId, images }) => {
            acc[variationId] = images;
            return acc;
          },
          {} as Record<string, VariationImageDTO[]>
        );

        setVariationImagesMap(mapResult);
      } catch (err) {
        console.error('Erro ao carregar imagens de variação:', err);
      }
    };

    fetchVariationImages();
  }, [product]);

  // Quando o produto for definido ou mudar a variação selecionada, montamos a galeria
  useEffect(() => {
    if (!product) return;

    // Sempre começa com as imagens do produto
    let combined = product.images ? [...product.images] : [];

    // Se houver uma variação selecionada, adicionamos as imagens dela
    if (selectedVariation) {
      const varImages = variationImagesMap[selectedVariation.id!] || [];
      combined = [
        ...combined,
        ...varImages.map((img) => img.imageUrl),
      ];
    }

    setGalleryImages(combined);

    // Se não há variação selecionada, usamos a primeira imagem do produto
    // Senão, se a variação tiver imagens, poderíamos atualizar o mainImage
    // Mas vamos deixar SEM trocar o mainImage automaticamente, exceto se não houver nada
    if (!mainImage && combined.length > 0) {
      setMainImage(combined[0]);
    }
  }, [product, selectedVariation, variationImagesMap, mainImage]);

  // Se for a primeira vez carregando e ainda não temos mainImage,
  // asseguramos que seja a 1ª do produto
  useEffect(() => {
    if (!mainImage && galleryImages.length > 0) {
      setMainImage(galleryImages[0]);
    }
  }, [galleryImages, mainImage]);

  // FETCH: Preço de entrega
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

  // FETCH: Dados de retirada
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
  // AÇÃO: Selecionar variação ao clicar
  const handleSelectVariation = (variation: ProductVariationDTO) => {
    setSelectedVariation(variation);
    // não alteramos mainImage diretamente aqui;
    // o useEffect acima já monta a galeria + mainImage se estiver vazio
  };

  // ----------------------------------------------------------------------------
  // AÇÕES DE SEGUIR, DESSEGUIR, MENSAGEM
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
  // CONDIÇÕES DE CARREGAMENTO E ERRO
  if (loading) return <p>Carregando produto...</p>;
  if (error) return <p>{error}</p>;
  if (!product) return <p>Nenhum produto encontrado.</p>;
  if (!channelData) return <div>Carregando canal...</div>;

  // ----------------------------------------------------------------------------
  // BOTÕES DO CANAL
  const formattedNickname = nickname.startsWith('@')
    ? nickname.slice(1)
    : nickname;

  const stageButtons = isOwner
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
        {
          text: 'Mensagem',
          backgroundColor: '#212121',
          imageSrc: chatIcon,
          onClick: handleMessageClick,
        },
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
        },
      ]
    : [
        {
          text: 'Seguir',
          backgroundColor: '#DF1414',
          imageSrc: followIcon,
          onClick: handleFollowClick,
        },
        {
          text: 'Mensagem',
          backgroundColor: '#212121',
          imageSrc: chatIcon,
          onClick: handleMessageClick,
        },
        {
          text: 'Compartilhar',
          backgroundColor: '#212121',
          imageSrc: shareIcon,
        },
      ];

  // ----------------------------------------------------------------------------
  // DADOS DE EXIBIÇÃO: Se existir variação selecionada, usamos dados dela, senão do produto
  const displayName = selectedVariation?.name
    ? selectedVariation.name
    : product.name;

  // Preço base
  const displayPrice = selectedVariation
    ? selectedVariation.price
    : product.salePrice;

  // Desconto
  const displayDiscount = selectedVariation
    ? selectedVariation.discountPrice
    : product.discountPrice;

  // ----------------------------------------------------------------------------
  // RENDER
  return (
    <div className={styles.productPage}>
      <div>
        <div className={styles.productConteiner}>
          {/* CABEÇALHO DO CANAL */}
          <div className={styles.productChannelImageDesc}>
            <div className={styles.channelHeader}>
              <div className={styles.channelLeft}>
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
              <div className={styles.channelRight}>
                {stageButtons
                  .filter((btn) => btn.text !== 'Seguir' && btn.text !== 'Amigos')
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

            {/* GALERIA DE IMAGENS (produto + variação) */}
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
              <div className={styles.thumbnailList}>
                {galleryImages.length > 1 &&
                  galleryImages.map((imgUrl, index) => (
                    <div
                      key={index}
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
                  ))}
              </div>
            </div>
            <div className={styles.shortDescription}>
              <span>{product.shortDescription}</span>
            </div>
          </div>

          {/* SEÇÃO PRINCIPAL DO PRODUTO/VARIAÇÃO */}
          <div className={styles.productSection}>
            <div className={styles.name}>
              <span>{displayName}</span>
            </div>

            {/* Seção de preços */}
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

            {/* BLOCOS DE VARIAÇÕES: Botões para escolher qual variação ver */}
            {product.variations && product.variations.length > 0 && (
              <div style={{ margin: '1rem 0' }}>
                <h4>Escolha uma Variação:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {product.variations.map((variation) => (
                    <button
                      key={variation.id}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1px solid #ccc',
                        cursor: 'pointer',
                        backgroundColor:
                          selectedVariation?.id === variation.id
                            ? '#eee'
                            : '#fff',
                      }}
                      onClick={() => handleSelectVariation(variation)}
                    >
                      {variation.attributes && variation.attributes.length > 0
                        ? variation.attributes
                            .map((attr) => attr.attributeValue)
                            .join(' / ')
                        : variation.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ATRIBUTOS DA VARIAÇÃO SELECIONADA */}
            {selectedVariation && selectedVariation.attributes && (
              <div style={{ marginTop: '1rem' }}>
                <h4>Atributos da variação:</h4>
                <ul>
                  {selectedVariation.attributes.map((attr, idx) => (
                    <li key={idx}>
                      <strong>{attr.attributeName}:</strong> {attr.attributeValue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Card title="Opiniões do produto">
              <div>
                <span>4.7</span>
              </div>
            </Card>
          </div>

          {/* DELIVERY E RETIRADA */}
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
                        <strong>Bairro:</strong>{' '}
                        {pickupDetails.address.neighborhood}
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

        <div>{/* Outros detalhes do produto, se necessário... */}</div>
      </div>
      <div>{/* Possivelmente mais conteúdo... */}</div>
    </div>
  );
};

export default ProductPage;
