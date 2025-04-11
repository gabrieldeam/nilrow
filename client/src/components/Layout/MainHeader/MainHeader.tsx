'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styles from './MainHeader.module.css';

import HeaderButton from '../../UI/HeaderButton/HeaderButton';
import LoginButton from '../../UI/LoginButton/LoginButton';
import ProtectedLink from '../../Helpers/ProtectedLink/ProtectedLink';

import logo from '../../../../public/assets/nilrow.svg';
import searchIcon from '../../../../public/assets/search.svg';
import createIcon from '../../../../public/assets/create.svg';
import addressIcon from '../../../../public/assets/address.svg';
import bagIcon from '../../../../public/assets/bag.svg';
import chatIcon from '../../../../public/assets/chat.svg';
import profileIcon from '../../../../public/assets/profile.svg';
import scanIcon from '../../../../public/assets/scan.svg';
import adminIcon from '../../../../public/assets/admin.svg';
import userIcon from '../../../../public/assets/user.png';

import { useLocationContext } from '../../../context/LocationContext';
import { useSearch } from '../../../hooks/useSearch';
import { isAdmin } from '../../../services/authService';

import ModalInfoAddress from '../../Modals/ModalInfoAddress/ModalInfoAddress';
import AddressModal from '../../Modals/AddressModal/AddressModal';
import { useAuth } from '../../../hooks/useAuth';
import { useBag } from '../../../context/BagContext';

import { getMyChannel, isChannelActive } from '@/services/channel/channelService';
import { getUserNickname } from '@/services/profileService';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

const MainHeader: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { location } = useLocationContext();
  const { searchTerm, setSearchTerm } = useSearch();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [showScanButton, setShowScanButton] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const divRef = useRef<HTMLDivElement | null>(null);
  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });
  const { bag } = useBag();
  const totalItems = bag.reduce((acc, item) => acc + item.quantity, 0);

  // Estados para o canal
  const [hasChannel, setHasChannel] = useState(false);
  const [channelImageUrl, setChannelImageUrl] = useState('');
  const [nickname, setNickname] = useState('');

  // Estado para controlar o tamanho da tela
  const [isLargeScreen, setIsLargeScreen] = useState(true);

  useEffect(() => {
    // Função que atualiza o state baseado na largura da janela
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 900);
    };

    // Executa ao montar o componente
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const checkAdminStatus = async () => {
        try {
          const response = await isAdmin();
          setIsAdminUser(response);
        } catch (error) {
          console.error('Erro ao verificar status de admin:', error);
        }
      };

      checkAdminStatus();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (divRef.current) {
      const rect = divRef.current.getBoundingClientRect();
      setButtonPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
    }
  }, []);

  // Novo useEffect para buscar dados do canal
  useEffect(() => {
    if (isAuthenticated) {
      const fetchChannelData = async () => {
        try {
          const channel = await getMyChannel();
          if (channel && channel.id) {
            setHasChannel(true);
            setChannelImageUrl(channel.imageUrl ?? '');
            const userNickname = await getUserNickname();
            setNickname(userNickname);
          } else {
            setHasChannel(false);
          }
        } catch (error) {
          console.error('Erro ao buscar dados do canal:', error);
          setHasChannel(false);
        }
      };
      fetchChannelData();
    }
  }, [isAuthenticated]);

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        let searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        searchHistory = searchHistory.filter((term: string) => term !== searchTerm);
        searchHistory.unshift(searchTerm);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 10)));

        router.push(`/search?q=${searchTerm}`);
      } else {
        router.push(`/search`);
      }
    },
    [router, searchTerm]
  );

  const getIsActive = useCallback((path: string) => pathname === path, [pathname]);

  const openAddressModal = () => {
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
  };

  // Função para tratar o clique no botão do canal
  const handleChannelClick = async () => {
    try {
      const channel = await getMyChannel();
      const activeStatus = await isChannelActive(channel.id);
      if (activeStatus) {
        router.push(`/${nickname}`);
      } else {
        router.push('/channel');
      }
    } catch {
      router.push('/profile/add');
    }
  };

  return (
    <header className={styles.mainheader}>
      <div className={styles.mainheaderLeft}>
        <Link href="/">
          <Image src={logo} alt="Logo" className={styles.mainlogo} />
        </Link>
        <form
          className={styles.searchForm}
          onSubmit={handleSearchSubmit}
          onMouseEnter={() => setShowScanButton(true)}
          onMouseLeave={() => setShowScanButton(false)}
        >
          <button type="submit" className={styles.searchButton}>
            <Image src={searchIcon} alt="Search" />
          </button>
          <input
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${styles.searchInput} roboto-medium`}
            onFocus={() => setShowScanButton(true)}
            onBlur={() => setShowScanButton(false)}
          />
          {showScanButton && (
            <div className={styles.scanButton}>
              <HeaderButton icon={scanIcon} />
            </div>
          )}
        </form>
      </div>
      <div className={styles.mainheaderRight}>
        <ProtectedLink to="/create">
          <HeaderButton icon={createIcon} isActive={getIsActive('/create')} />
        </ProtectedLink>
        <div ref={divRef}>
          <HeaderButton
            icon={addressIcon}
            onClick={openAddressModal}
            // Aqui, se a tela for grande, mostramos o texto normalmente; caso contrário, passamos uma string vazia
            text={
              isLargeScreen
                ? location.city
                  ? `${location.city} - ${location.zip}`
                  : 'Atualizar local'
                : ''
            }
          />
        </div>
        <ProtectedLink to="/bag">
          <div className={styles.bagButtonContainer}>
            <HeaderButton icon={bagIcon} isActive={getIsActive('/bag')} />
            {totalItems > 0 && <span className={styles.bagCount}>{totalItems}</span>}
          </div>
        </ProtectedLink>
        {isAuthenticated && (
          <>
            <HeaderButton icon={chatIcon} link="/chat" isActive={getIsActive('/chat')} />
            <HeaderButton icon={profileIcon} link="/profile" isActive={getIsActive('/profile')} />
            {/* Novo botão para o canal, exibido se o usuário possuir canal */}
            {hasChannel && (
              <a onClick={handleChannelClick} className={styles.channelLink}>
                <Image
                  src={channelImageUrl ? `${apiUrl}${channelImageUrl}` : userIcon}
                  alt="Canal"
                  width={46}
                  height={44}
                  className={styles.channelImage}
                />
              </a>
            )}
            {isAdminUser && <HeaderButton icon={adminIcon} link="/admin" isActive={getIsActive('/admin')} />}
          </>
        )}
        {!isAuthenticated && <LoginButton text="Login" link="/login" />}
      </div>
      <ModalInfoAddress buttonPosition={buttonPosition} />
      <AddressModal isOpen={isAddressModalOpen} onClose={closeAddressModal} />
    </header>
  );
};

export default memo(MainHeader);
