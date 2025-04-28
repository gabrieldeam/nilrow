'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useBag } from '@/context/BagContext';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/services/authService';
import { useNotification } from '@/hooks/useNotification';

import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import CustomInput from '@/components/UI/CustomInput/CustomInput';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import CartItem from '@/components/UI/CartItem/CartItem';
import Modal from '@/components/Modals/Modal/Modal';
import followIcon from '../../../public/assets/follow.svg';
import shareIcon from '../../../public/assets/share.svg';
import defaultImage from '../../../public/assets/user.png';

import { isChannelOwner } from '@/services/channel/channelService';
import {
  followChannel,
  unfollowChannel,
  isFollowing,
} from '@/services/channel/followService';
import { getCart } from '@/services/cartService';
import { CartItemDTO } from '@/types/services/cart';

import styles from './Bag.module.css';
import ExpandableCard from '@/components/UI/ExpandableCard/ExpandableCard';
import { buildLocalCart } from '@/services/localCartService';
import { useLocationContext } from '@/context/LocationContext';

import {
  getDeliveryPrice
} from '@/services/deliveryService';
import {
  getActivePickupDetailsByCatalogId
} from '@/services/pickupService';

import { DeliveryPriceDTO } from '@/types/services/delivery';
import { PickupActiveDetailsDTO } from '@/types/services/pickup';

interface StageButtonProps {
  text: string;
  backgroundColor: string;
  imageSrc?: any;
  disabled?: boolean;
  onClick?: () => Promise<void> | void;
}

const BagPage = () => {
  /* --------------------------------------------------
   * context & router
   * -------------------------------------------------- */
  const { bag, clearBag, removeFromBag } = useBag();
  const router = useRouter();
  const { setMessage } = useNotification();
  const [obsModalChannel, setObsModalChannel] = useState<string | null>(null);
  const makeGroupKey = (channelId: string, catalogId: string) =>
    `${channelId}::${catalogId}`;

  // texto temporário dentro do textarea
  const [tempObs, setTempObs] = useState('');
  
  /* --------------------------------------------------
   * local state
   * -------------------------------------------------- */
  const [auth, setAuth] = useState<{ isAuthenticated: boolean } | null>(null);
  const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);
  const [followingChannels, setFollowingChannels] = useState<Record<string, boolean>>({});
  const [owners, setOwners] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});
  const { location } = useLocationContext();
  const safeCartItems = cartItems.filter(
    (it) => it && it.channel  
  );

  /* --------------------------------------------------
   * env vars
   * -------------------------------------------------- */
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL ?? '';

  type GroupDict<T> = Record<string, T>; 
  type ItemsDict = GroupDict<CartItemDTO[]>;
  type ShipChoice = { kind: 'delivery' | 'pickup'; price: number };
  type ChoiceDict = GroupDict<ShipChoice | null>;

  const [deliveryByGroup, setDeliveryByGroup] = useState<
  GroupDict<DeliveryPriceDTO | null | undefined>
  >({});

  const [pickupByGroup, setPickupByGroup] = useState<
    GroupDict<PickupActiveDetailsDTO | null | undefined>
  >({});

  /** escolha de entrega/retirada do usuário por (canal+catálogo) */
const [choiceByGroup, setChoiceByGroup] = useState<ChoiceDict>({});
const [obsByGroup, setObsByGroup] = useState<GroupDict<string>>({});
const [showAddrByGroup, setShowAddrByGroup] = useState<GroupDict<boolean>>({});


  /* --------------------------------------------------
   * auth & cart bootstrap
   * -------------------------------------------------- */
  useEffect(() => {
    const fetch = async () => {
      if (auth?.isAuthenticated) {
        const { items } = await getCart();
        setCartItems(items);
        return;
      }
  
      // user anônimo ---------------  
      const coordsOk = location && location.latitude !== 0;
      const items = await buildLocalCart(
        bag,
        coordsOk ? location.latitude : undefined,
        coordsOk ? location.longitude : undefined,
      );
      setCartItems(items);
    };
  
    fetch().catch((e) => console.error('Erro ao montar carrinho:', e));
  }, [bag, auth?.isAuthenticated, location]);
  
  useEffect(() => {
    checkAuth()
      .then(setAuth)                   // { isAuthenticated: boolean }
      .catch(() => setAuth({ isAuthenticated: false }));
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /* --------------------------------------------------
   * fetch follow & owner status per channel
   * -------------------------------------------------- */
  useEffect(() => {
    const channelIds = Array.from(
      new Set(
        safeCartItems
          .map(i => i.channel?.id)   // ⟵ optional-chaining
          .filter(Boolean)           //    remove undefined
      )
    );
    
    channelIds.forEach((id) => {
      isFollowing(id)
        .then((is) => setFollowingChannels((prev) => ({ ...prev, [id]: is })))
        .catch((err) => console.error('Erro ao checar follow:', err));

      isChannelOwner(id)
        .then((is) => setOwners((prev) => ({ ...prev, [id]: is })))
        .catch((err) => console.error('Erro ao checar dono do canal:', err));
    });
  }, [cartItems]);

  /* --------------------------------------------------
   * follow / unfollow handlers
   * -------------------------------------------------- */
  const handleFollowClick = useCallback(
    async (channelId: string) => {
      if (followLoading[channelId]) return;
      setFollowLoading((prev) => ({ ...prev, [channelId]: true }));
      try {
        await followChannel(channelId);
        setFollowingChannels((prev) => ({ ...prev, [channelId]: true }));
        setMessage('Canal seguido com sucesso!', 'success');
      } catch (error: any) {
        console.error('Erro ao seguir o canal:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          router.push('/login');
          return;
        }
        setMessage('Não foi possível seguir o canal. Tente novamente.', 'error');
      } finally {
        setFollowLoading((prev) => ({ ...prev, [channelId]: false }));
      }
    },
    [followLoading, router, setMessage]
  );

  const handleUnfollowClick = useCallback(
    async (channelId: string) => {
      try {
        await unfollowChannel(channelId);
        setFollowingChannels((prev) => ({ ...prev, [channelId]: false }));
        setMessage('Você deixou de seguir o canal.', 'success');
      } catch (error) {
        console.error('Erro ao deixar de seguir o canal:', error);
        setMessage('Erro ao deixar de seguir o canal!', 'error');
      }
    },
    [setMessage]
  );


  // remove todos os itens daquele canal do bag
  const handleRemoveAll = (items: CartItemDTO[]) => {
      items.forEach(item => {
         removeFromBag({
           id: item.variationId ?? item.productId,
           isVariation: !!item.variationId,
           quantity: item.quantity,
         });
       });
       setChoiceByGroup(prev => ({ ...prev, [makeGroupKey(items[0].channel.id, items[0].catalogId)]: null }));
     };
  

  // abre o modal e carrega texto já salvo (se houver)
  const handleOpenObs = (gKey: string) => {
    setTempObs(obsByGroup[gKey] ?? '');
    setObsModalChannel(gKey);
  };
  
  const handleSaveObs = () => {
    if (!obsModalChannel) return;
    setObsByGroup(prev => ({ ...prev, [obsModalChannel]: tempObs }));
    setObsModalChannel(null);
  };
  


  /* --------------------------------------------------
   * group ONLY visible items by channel
   * -------------------------------------------------- */
  const visibleItems = safeCartItems.filter((item) => {
    const id = item.variationId ?? item.productId;
    return bag.some((b) => b.id === id && b.quantity > 0);
  });  
  
  /* agora agrupamos por canal + catálogo */
  const itemsByGroup: ItemsDict =
  visibleItems.reduce<ItemsDict>((acc, item) => {
    const gKey = makeGroupKey(item.channel?.id, item.catalogId);
    if (!acc[gKey]) acc[gKey] = [];
    acc[gKey].push(item);
    return acc;
  }, {});
  
  const shipCostByGroup: GroupDict<number> = Object.fromEntries(
    Object.keys(itemsByGroup).map(k => [k, choiceByGroup[k]?.price ?? 0])
  );

  const subtotais: GroupDict<number> = Object.entries(itemsByGroup)
  .reduce((acc, [gKey, items]) => {
    const subtotal = items.reduce((sum, item) => {
      const qty = bag.find(
        b => b.id === (item.variationId ?? item.productId)
      )?.quantity ?? 0;
      return sum + qty * item.unitPrice;
    }, 0);
    acc[gKey] = subtotal;
    return acc;
  }, {} as GroupDict<number>);


  // total de produtos (soma de todos os subtotais)
const totalProdutos = Object.values(subtotais).reduce((sum, v) => sum + v, 0);
// total de fretes (soma de todas as entregas escolhidas)
const totalFrete = Object.values(shipCostByGroup).reduce((sum, v) => sum + v, 0);
// total da compra = produtos + fretes
const totalGeral = totalProdutos + totalFrete;



useEffect(() => {
  if (!location || location.latitude === 0) return;

  Object.entries(itemsByGroup).forEach(([gKey, items]) => {
    const catalogId = items[0].catalogId;

    if (deliveryByGroup[gKey] === undefined) {
      getDeliveryPrice(catalogId, location.latitude, location.longitude)
        .then(del => setDeliveryByGroup(p => ({ ...p, [gKey]: del })))
        .catch(()  => setDeliveryByGroup(p => ({ ...p, [gKey]: null })));
    }

    if (pickupByGroup[gKey] === undefined) {
      getActivePickupDetailsByCatalogId(catalogId)
        .then(pu => setPickupByGroup(p => ({ ...p, [gKey]: pu })))
        .catch(()  => setPickupByGroup(p => ({ ...p, [gKey]: null })));
    }

    /* ---------- aqui entra a auto-seleção ---------- */
    const del = deliveryByGroup[gKey];
    const pu  = pickupByGroup[gKey];

    if (del !== undefined && pu !== undefined) {
      if (del && pu === null && !choiceByGroup[gKey]) {
        setChoiceByGroup(prev => ({ ...prev,
          [gKey]: { kind:'delivery', price: del.price } }));
      }
      if (pu && del === null && !choiceByGroup[gKey]) {
        setChoiceByGroup(prev => ({ ...prev,
          [gKey]: { kind:'pickup', price: pu.precoRetirada } }));
      }
    }
  });
}, [itemsByGroup, location, deliveryByGroup, pickupByGroup, choiceByGroup]);

  
  
  const toggleShowAddress = (gKey: string) => {
    setShowAddrByGroup(prev => ({
      ...prev,
      [gKey]: !prev[gKey],
    }));
  };
  

  /* --------------------------------------------------
   * render
   * -------------------------------------------------- */
  return (
    <>
      <MobileHeader
        title="Carrinho"
        buttons={{ close: true, address: true, share: true }}
        handleBack={handleBack}
      />

      <div className={styles.bagPage}>
        <div className={styles.bagPageConteiner}>
          <div className={styles.leftColumnConteiner}>
            {bag.length === 0 ? (
              <p>O carrinho está vazio.</p>
            ) : (
              Object.entries(itemsByGroup).map(([gKey, items]) => {
                const { channel, catalogId } = items[0];
                const [channelId] = gKey.split('::');
                const isOwner = owners[channelId];
                const lojaTotal = subtotais[gKey] + shipCostByGroup[gKey];
                const isFollowingChannel = followingChannels[channelId];

                const buttons: StageButtonProps[] = isOwner
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
                        onClick: () => handleUnfollowClick(channelId),
                      },
                    ]
                  : auth === null
                  ? [
                      {
                        text: '…',
                        backgroundColor: '#ccc',
                      },
                    ]
                  : auth.isAuthenticated
                  ? [
                      {
                        text: 'Seguir',
                        backgroundColor: '#DF1414',
                        imageSrc: followIcon,
                        onClick: () => handleFollowClick(channelId),
                      },
                    ]
                  : [
                      {
                        text: 'Seguir',
                        backgroundColor: '#DF1414',
                        imageSrc: followIcon,
                        onClick: async () => {
                          await router.push('/login');
                        },
                      },
                    ];

                const avatarSrc = channel?.imageUrl ? `${apiUrl}${channel.imageUrl}` : defaultImage;

                return (
                  <div key={gKey} className={styles.channelSection}>
                    <div className={styles.channelHeader}>
                      <div className={styles.channelLeft}>
                        <div className={styles.channelTitle}>
                          <Image
                            src={avatarSrc}
                            alt={`${channel.name} – Imagem`}
                            className={styles.channelImage}
                            width={130}
                            height={130}
                          />
                          <div
                            className={styles.channelInfo}
                            onClick={() =>
                              (window.location.href = `${frontUrl}/${channel.nickname}`)
                            }
                          >
                            <h2 className={styles.channelName}>{channel.name}</h2>
                            <p className={styles.channelNickname}>@{channel.nickname}</p>
                          </div>
                        </div>
                        <div className={styles.channelFollow}>
                          {buttons.map((button, index) => (
                            <StageButton
                              key={index}
                              text={button.text}
                              backgroundColor={button.backgroundColor}
                              imageSrc={button.imageSrc}
                              onClick={button.onClick}
                              disabled={button.disabled}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={styles.productConteiner}>
                      <div className={styles.leftColumn}>
                        {items.map((item) => (
                          <CartItem key={item.id} item={item} apiUrl={apiUrl} />
                        ))}
                        <div className={styles.productSubtotal1nd}>
                          <Card>
                            <div className={styles.productSubtotalCard}>
                              <div className={styles.productSubtotal}>
                                <span>Subtotal</span>
                                <span>R$ {subtotais[gKey].toFixed(2)}</span>
                              </div>
                              <div className={styles.productSubtotal}>
                                <span>Entrega</span>
                                <span>R$ {shipCostByGroup[gKey].toFixed(2)}</span>
                              </div>
                              <div className={styles.productSubtotal /* pode criar um modificador */}>
                                <strong>Total da loja</strong>
                                <strong>R$ {lojaTotal.toFixed(2)}</strong>
                              </div>
                            </div>
                          </Card>
                        </div>
                        
                      </div>
                      <div className={styles.rightColumn}>
                        <button
                          className={styles.channelActionBtn}
                          onClick={() => handleOpenObs(gKey)}
                        >
                          Criar observação
                        </button>
                        <button
                          className={styles.channelActionBtnRemove}
                          onClick={() => handleRemoveAll(items)}
                        >
                          Excluir todos
                        </button>
                        

                        {/* exibe a observação salva, se existir */}
                        {obsByGroup[gKey] && (
                          <p className={styles.channelObservation}>
                            {obsByGroup[gKey]}
                          </p>
                        )}


                        {deliveryByGroup[gKey] && deliveryByGroup[gKey] !== null && (
                          <ExpandableCard title="Delivery">
                            {(() => {                              
                              const del = deliveryByGroup[gKey];
                              if (del === undefined) return <p>Carregando delivery...</p>;
                              if (del === null)      return <p>Delivery indisponível</p>;
                              // else mostramos o payload:
                              return (
                                <div className={styles.pickupBox}>
                                  <div className={styles.labels}>
                                    <span>Preço</span>
                                    <span>Tempo de Entrega</span>
                                  </div>
                                  <label className={styles.radioLine}>
                                    <input
                                      type="radio"
                                      name={`ship-${gKey}`}
                                      checked={choiceByGroup[gKey]?.kind === 'delivery'}
                                      onChange={() =>
                                        setChoiceByGroup(prev => ({
                                          ...prev,
                                          [gKey]: { kind: 'delivery', price: del.price }
                                        }))
                                      }
                                    />                                    
                                      <div className={styles.pickupInfo}>
                                        <div className={styles.price}>
                                          {del.price === 0 ? 'Grátis' : `R$ ${del.price}`}
                                        </div>
                                        <div className={styles.availability}>
                                          {del.averageDeliveryTime} min
                                        </div> 
                                      </div>                                                                        
                                    </label>
                                </div>
                              );
                            })()}

                          </ExpandableCard>
                        )}
                        {pickupByGroup[gKey] && pickupByGroup[gKey] !== null && (
                          <ExpandableCard title="Retirada">
                            {(() => {
                              const pu   = pickupByGroup[gKey];
                              if (pu === undefined) return <p>Carregando retirada...</p>;
                              if (pu === null)      return <p>Retirada indisponível</p>;
                              const full = showAddrByGroup[gKey];
                              const addr = pu.address;
                              return (
                                <div className={styles.pickupBox}>
                                  <p className={styles.pickupTitle}>
                                    <strong>Retirar em:</strong>{' '}
                                    {full
                                      ? `${addr.street}, ${addr.neighborhood}, ${addr.cep}, ${addr.city}, ${addr.state}${addr.complement ? `, ${addr.complement}` : ''}`
                                      : <span className={styles.truncated}>{addr.street}</span>
                                    }
                                    <span
                                      className={styles.verMais}
                                      onClick={() => toggleShowAddress(gKey)}
                                    >
                                      {full ? 'ver menos' : 'ver mais'}
                                    </span>
                                  </p>
                                  <div className={styles.labels}>
                                    <span>Preço</span>
                                    <span>Disponibilidade</span>
                                  </div>
                                  <label className={styles.radioLine}>
                                    <input
                                      type="radio"
                                      name={`ship-${gKey}`}
                                      checked={choiceByGroup[gKey]?.kind === 'pickup'}
                                      onChange={() =>
                                        setChoiceByGroup(prev => ({
                                          ...prev,
                                          [gKey]: { kind: 'pickup', price: pu.precoRetirada }
                                        }))
                                      }
                                    />
                                      <div className={styles.pickupInfo}>
                                        <div className={styles.price}>
                                          {pu.precoRetirada === 0 ? 'Grátis' : `R$ ${pu.precoRetirada}`}
                                        </div>
                                        <div className={styles.availability}>
                                          em {pu.prazoRetirada} dias
                                        </div>
                                      </div>                                  
                                  </label>
                                </div>
                              );
                            })()}
                          </ExpandableCard>
                        )}
                        <div className={styles.productSubtotal2nd}>
                          <Card>
                            <div className={styles.productSubtotalCard}>
                              <div className={styles.productSubtotal}>
                                <span>Subtotal</span>
                                <span>R$ {subtotais[gKey].toFixed(2)}</span>
                              </div>
                              <div className={styles.productSubtotal}>
                                <span>Entrega</span>
                                <span>R$ {shipCostByGroup[gKey].toFixed(2)}</span>
                              </div>
                              <div className={styles.productSubtotal /* pode criar um modificador */}>
                                <strong>Total da loja</strong>
                                <strong>R$ {lojaTotal.toFixed(2)}</strong>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.rightColumnConteiner}>
            {bag.length > 0 && (
              <button onClick={clearBag}>Limpar carrinho</button>
            )}
            <Card>
              <div className={styles.productSubtotalCard}>
                <div className={styles.productSubtotal}>
                  <span>Total produtos</span>
                  <span>R$ {totalProdutos.toFixed(2)}</span>
                </div>
                <div className={styles.productSubtotal}>
                  <span>Total entregas</span>
                  <span>R$ {totalFrete.toFixed(2)}</span>
                </div>
                <div className={styles.productSubtotal}>
                  <strong>Total da compra</strong>
                  <strong>R$ {totalGeral.toFixed(2)}</strong>
                </div>
              </div>
            </Card>           
          </div>
        </div>
      </div>

      <Modal isOpen={!!obsModalChannel} onClose={() => setObsModalChannel(null)}>
        <h2>Observação</h2>

        <CustomInput
          title=""   
          placeholder="Digite sua observação aqui…"
          isTextarea   
          value={tempObs}
          onChange={(e) => setTempObs(e.target.value)}
          name={`obs-${obsModalChannel}`} 
        />

        <StageButton
          text="Salvar"
          backgroundColor="#7B33E5"  
          onClick={handleSaveObs}
          width="auto" 
        />
      </Modal>

    </>
  );
};

export default BagPage;
