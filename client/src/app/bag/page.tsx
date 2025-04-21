'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useBag } from '@/context/BagContext';
import { useRouter } from 'next/navigation';
import { checkAuth } from '@/services/authService';
import { useNotification } from '@/hooks/useNotification';

import Card from '@/components/UI/Card/Card';
import StageButton from '@/components/UI/StageButton/StageButton';

import followIcon from '../../../public/assets/follow.svg';

import {
  followChannel,
  unfollowChannel,
  isFollowing,
} from '@/services/channel/followService';
import { getCart } from '@/services/cartService';
import { CartItemDTO } from '@/types/services/cart';

import styles from './Bag.module.css';

interface StageButtonProps {
  text: string;
  backgroundColor: string;
  imageSrc?: any;
  disabled?: boolean;
  onClick?: () => Promise<void>;
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
  const [isFollowingChannel, setIsFollowingChannel] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItemDTO[]>([]);

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

  /* --------------------------------------------------
   * follow status (runs when cart loaded)
   * -------------------------------------------------- */
  useEffect(() => {
    const channel = cartItems[0]?.channel;
    if (!channel) return;

    isFollowing(channel.id)
      .then(setIsFollowingChannel)
      .catch((err) => console.error('Erro ao checar follow:', err));
  }, [cartItems]);

  /* --------------------------------------------------
   * follow / unfollow handlers
   * -------------------------------------------------- */
  const handleFollowClick = useCallback(async () => {
    const channel = cartItems[0]?.channel;
    if (!channel || followLoading) return;

    setFollowLoading(true);
    try {
      await followChannel(channel.id);
      setIsFollowingChannel(true);
      setMessage('Canal seguido com sucesso!', 'success');
    } catch (error: any) {
      console.error('Erro ao seguir o canal:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        router.push('/login');
        return;
      }
      setMessage('Não foi possível seguir o canal. Tente novamente.', 'error');
    } finally {
      setFollowLoading(false);
    }
  }, [cartItems, followLoading, router, setMessage]);

  const handleUnfollowClick = useCallback(async () => {
    const channel = cartItems[0]?.channel;
    if (!channel) return;

    try {
      await unfollowChannel(channel.id);
      setIsFollowingChannel(false);
      setMessage('Você deixou de seguir o canal.', 'success');
    } catch (error) {
      console.error('Erro ao deixar de seguir o canal:', error);
      setMessage('Erro ao deixar de seguir o canal!', 'error');
    }
  }, [cartItems, setMessage]);

  /* --------------------------------------------------
   * stage buttons
   * -------------------------------------------------- */
  const stageButtons: StageButtonProps[] =
    auth === null
      ? [{ text: '…', backgroundColor: '#ccc' }]
      : isFollowingChannel
      ? [
          {
            text: 'Amigos',
            backgroundColor: '#212121',
            onClick: handleUnfollowClick,
          },
        ]
      : auth?.isAuthenticated
      ? [
          {
            text: 'Seguir',
            backgroundColor: '#DF1414',
            imageSrc: followIcon,
            onClick: handleFollowClick,
            disabled: followLoading,
          },
        ]
      : [
          {
            text: 'Seguir',
            backgroundColor: '#DF1414',
            imageSrc: followIcon,
            onClick: async () => await router.push('/login'),
          },
        ];

  /* --------------------------------------------------
   * derived data
   * -------------------------------------------------- */
  const channel = cartItems[0]?.channel;

  /* --------------------------------------------------
   * render
   * -------------------------------------------------- */
  return (
    <div className={styles.bagPage}>
      <div className={styles.bagPageConteiner}>
        <div className={styles.leftColumn}>
          <div className={styles.productConteiner}>
            {/* header do canal */}
            {channel && (
              <div className={styles.channelHeader}>
                <div className={styles.channelLeft}>
                  <div className={styles.channelTitle}>
                    <Image
                      src={`${apiUrl}${channel.imageUrl}`}
                      alt={`${channel.name} - Imagem`}
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
                    {stageButtons.map((button, index) => (
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
            )}

            {/* lista de itens do carrinho */}
            {cartItems.length === 0 ? (
              <p>O carrinho está vazio.</p>
            ) : (
              <ul>
                {cartItems.map((item) => (
                  <li key={item.id} className={styles.cartItem}>
                    <Card>
                      <div className={styles.itemContent}>
                        <Image
                          src={`${apiUrl}${item.imageUrl}`}
                          alt={item.name}
                          width={80}
                          height={80}
                        />
                        <div className={styles.itemDetails}>
                          <h3>{item.name}</h3>
                          <p>Qtd: {item.quantity}</p>
                          <p>
                            Canal: {item.channel.name} ({item.channel.nickname})
                          </p>
                        </div>
                        <button onClick={() => removeFromBag(item.id)}>
                          Remover
                        </button>
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
            {cartItems.length > 0 && (
              <button onClick={clearBag} style={{ marginTop: '1rem' }}>
                Limpar carrinho
              </button>
            )}
          </div>
        </div>
        <div className={styles.rightColumn}></div>
      </div>
    </div>
  );
};

export default BagPage;
