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

import { useLocationContext } from '../../../context/LocationContext';
import { useSearch } from '../../../hooks/useSearch';
import { isAdmin } from '../../../services/authService';

import ModalInfoAddress from '../../Modals/ModalInfoAddress/ModalInfoAddress';
import AddressModal from '../../Modals/AddressModal/AddressModal';
import { useAuth } from '../../../hooks/useAuth';

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
            text={location.city ? `${location.city} - ${location.zip}` : 'Atualizar local'}
          />
        </div>
        <ProtectedLink to="/bag">
          <HeaderButton icon={bagIcon} isActive={getIsActive('/bag')} />
        </ProtectedLink>
        {isAuthenticated && (
          <>
            <HeaderButton icon={chatIcon} link="/chat" isActive={getIsActive('/chat')} />
            <HeaderButton icon={profileIcon} link="/profile" isActive={getIsActive('/profile')} />
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