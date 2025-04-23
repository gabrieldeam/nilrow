'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useBag } from '@/context/BagContext';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/services/authService';
import { useNotification } from '@/hooks/useNotification';

import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';
import MobileHeader from '@/components/Layout/MobileHeader/MobileHeader';
import CartItem from '@/components/UI/CartItem/CartItem';

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
  const { removeFromBag, clearBag } = useBag();
  const router = useRouter();
  const { setMessage } = useNotification();

  /* --------------------------------------------------
   * local state
   * -------------------------------------------------- */
  const [auth, setAuth] = useState<{ isAuthenticated: boolean } | null>(null);
  const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);
  const [followingChannels, setFollowingChannels] = useState<Record<string, boolean>>({});
  const [owners, setOwners] = useState<Record<string, boolean>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  /* --------------------------------------------------
   * env vars
   * -------------------------------------------------- */
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
  const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL ?? '';

  /* --------------------------------------------------
   * auth & cart bootstrap
   * -------------------------------------------------- */
  useEffect(() => {
    checkAuth()
      .then(setAuth)
      .catch(() => setAuth({ isAuthenticated: false }));

    getCart()
      .then(({ items }) => setCartItems(items))
      .catch((err) => console.error('Erro ao buscar carrinho:', err));
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  /* --------------------------------------------------
   * fetch follow & owner status per channel
   * -------------------------------------------------- */
  useEffect(() => {
    const channelIds = Array.from(new Set(cartItems.map((item) => item.channel.id)));
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

  /* --------------------------------------------------
   * group items by channel
   * -------------------------------------------------- */
  const itemsByChannel = cartItems.reduce((acc, item) => {
    const key = item.channel.id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, CartItemDTO[]>);

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
            {cartItems.length === 0 ? (
              <p>O carrinho está vazio.</p>
            ) : (
              Object.entries(itemsByChannel).map(([channelId, items]) => {
                const channel = items[0].channel;
                const isOwner = owners[channelId];
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
                const avatarSrc = channel.imageUrl ? `${apiUrl}${channel.imageUrl}` : defaultImage;

                return (
                  <div key={channelId} className={styles.channelSection}>
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
                            onClick={() => (window.location.href = `${frontUrl}/${channel.nickname}`)}
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
                      </div>
                      <div className={styles.rightColumn}>
                        <ExpandableCard title="Delivery">Aqui</ExpandableCard>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.rightColumnConteiner}>
            <Card>Aqui</Card>
            {cartItems.length > 0 && (
              <button onClick={clearBag}>
                Limpar carrinho
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BagPage;
