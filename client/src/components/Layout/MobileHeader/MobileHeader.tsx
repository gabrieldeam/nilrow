'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MobileHeaderProps } from '../../../types/components/Layout/MobileHeader';
import HeaderButton from '../../UI/HeaderButton/HeaderButton';
import SearchLayout from '../../UI/SearchLayout/SearchLayout';
import AddressModal from '../../Modals/AddressModal/AddressModal';
import QRCodeModal from '../../Modals/QRCodeModal/QRCodeModal';
import ChatModal from '../../Modals/ChatModal/ChatModal';
import { useLocationContext } from '../../../context/LocationContext';
import styles from './MobileHeader.module.css';

import addressIcon from '../../../../public/assets/address.svg';
import closeIcon from '../../../../public/assets/close.svg';
import chatIcon from '../../../../public/assets/chat.svg';
import bagIcon from '../../../../public/assets/bag.svg';
import shareIcon from '../../../../public/assets/share.svg';
import searchIcon from '../../../../public/assets/search.svg';
import backIcon from '../../../../public/assets/setadireito.svg';
import settingsIcon from '../../../../public/assets/settings.svg';
import qrcodeIcon from '../../../../public/assets/qrcode.svg';
import publishIcon from '../../../../public/assets/publish.svg';
import scanIcon from '../../../../public/assets/scan.svg';
import blockedIcon from '../../../../public/assets/blocked.svg';
import notificationsIcon from '../../../../public/assets/notifications.svg';
import trashIcon from '../../../../public/assets/trash.svg';
import ordersIcon from '../../../../public/assets/orders.svg';
import templateIcon from '../../../../public/assets/template.svg'; // Novo ícone para Template
import logo from '../../../../public/assets/nilrow.svg';
import checkWhite from '../../../../public/assets/check-white.svg';

const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  buttons,
  handleBack,
  onFilter, // callback para o botão de filtro
  handleTemplate, // callback para o novo botão Template
  showLogo = false,
  showSearch = false,
  searchPlaceholder = 'Buscar...',
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  onDelete,
}) => {
  const { location } = useLocationContext();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const openAddressModal = () => setIsAddressModalOpen(true);
  const closeAddressModal = () => setIsAddressModalOpen(false);

  const openQRCodeModal = () => setIsQRCodeModalOpen(true);
  const closeQRCodeModal = () => setIsQRCodeModalOpen(false);

  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => setIsChatModalOpen(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const icons = {
    address: addressIcon,
    close: closeIcon,
    chat: chatIcon,
    bag: bagIcon,
    share: shareIcon,
    search: searchIcon,
    back: backIcon,
    settings: settingsIcon,
    qrcode: qrcodeIcon,
    publish: publishIcon,
    scan: scanIcon,
    blocked: blockedIcon,
    notifications: notificationsIcon,
    trash: trashIcon,
    orders: ordersIcon,
    filter: checkWhite, // ícone para filtro
    template: templateIcon, // ícone para Template
  };

  return (
    <>
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          {buttons.close && <HeaderButton icon={icons.close} onClick={handleBack} />}
          {buttons.address && (
            <HeaderButton
              icon={icons.address}
              onClick={openAddressModal}
              text={location?.city ? `${location.city} - ${location.zip}` : 'Atualizar local'}
            />
          )}
          {buttons.chat && <HeaderButton icon={icons.chat} onClick={openChatModal} />}
        </div>
        <div className={`${styles.mobileHeaderTitle} ${showSearch ? styles.withSearch : ''}`}>
          {showLogo && !showSearch && <Image src={logo} alt="Logo" width={149} height={30} />}
          {showSearch && (
            <div className={styles.searchLayoutWrapper}>
              <SearchLayout
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange || (() => {})}
                onSubmit={onSearchSubmit || (() => {})}
              />
            </div>
          )}
          {!showLogo && !showSearch && <h1>{title}</h1>}
        </div>
        <div className={styles.mobileHeaderRight}>
          {buttons.bag && <HeaderButton icon={icons.bag} link="/bag" />}
          {buttons.share && <HeaderButton icon={icons.share} link="/share" />}
          {buttons.filter && <HeaderButton icon={icons.filter} onClick={onFilter} />}
          {buttons.search && <HeaderButton icon={icons.search} link="/search" />}
          {buttons.back && <HeaderButton icon={icons.back} onClick={handleBack} />}
          {buttons.settings && <HeaderButton icon={icons.settings} link="/settings" />}
          {buttons.qrcode && <HeaderButton icon={icons.qrcode} onClick={openQRCodeModal} />}
          {buttons.publish && <HeaderButton icon={icons.publish} link="/publish" />}
          {buttons.scan && <HeaderButton icon={icons.scan} link="/scan" />}
          {buttons.blocked && <HeaderButton icon={icons.blocked} link="/blocked" />}
          {buttons.notifications && <HeaderButton icon={icons.notifications} link="/notifications" />}
          {buttons.delete && <HeaderButton icon={icons.trash} onClick={onDelete} />}
          {buttons.orders && <HeaderButton icon={icons.orders} link="/orders" />}
          {buttons.template && <HeaderButton icon={icons.template} onClick={handleTemplate} />}
        </div>
      </div>
      <AddressModal isOpen={isAddressModalOpen} onClose={closeAddressModal} />
      <QRCodeModal isOpen={isQRCodeModalOpen} onClose={closeQRCodeModal} url={currentUrl} nickname={title || ''} />
      <ChatModal isOpen={isChatModalOpen} onClose={closeChatModal} />
    </>
  );
};

export default MobileHeader;
