import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import SearchLayout from '../../../components/UI/SearchLayout/SearchLayout'; // Certifique-se de importar o SearchLayout
import './MobileHeader.css';
import addressIcon from '../../../assets/address.svg';
import closeIcon from '../../../assets/close.svg';
import chatIcon from '../../../assets/chat.svg';
import bagIcon from '../../../assets/bag.svg';
import shareIcon from '../../../assets/share.svg';
import searchIcon from '../../../assets/search.svg';
import backIcon from '../../../assets/setadireito.svg';
import settingsIcon from '../../../assets/settings.svg';
import qrcodeIcon from '../../../assets/qrcode.svg';
import publishIcon from '../../../assets/publish.svg';
import scanIcon from '../../../assets/scan.svg';
import blockedIcon from '../../../assets/blocked.svg';
import notificationsIcon from '../../../assets/notifications.svg';
import trashIcon from '../../../assets/trash.svg'; // Ícone de delete
import logo from '../../../assets/nilrow.svg';
import { LocationContext } from '../../../context/LocationContext';
import AddressModal from '../../Others/AddressModal/AddressModal';
import QRCodeModal from '../../UI/QRCodeModal/QRCodeModal';
import ChatModal from '../../Others/ChatModal/ChatModal'; // Certifique-se de importar o ChatModal

const MobileHeader = ({ title, buttons, handleBack, showLogo, showSearch, searchPlaceholder, searchValue, onSearchChange, onSearchSubmit, onDelete }) => {
    const { location } = useContext(LocationContext);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isQRCodeModalOpen, setIsQRCodeModalOpen] = useState(false);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false); // Estado para controlar a abertura do ChatModal

    const openAddressModal = () => {
        setIsAddressModalOpen(true);
    };

    const closeAddressModal = () => {
        setIsAddressModalOpen(false);
    };

    const openQRCodeModal = () => {
        setIsQRCodeModalOpen(true);
    };

    const closeQRCodeModal = () => {
        setIsQRCodeModalOpen(false);
    };

    const openChatModal = () => { // Função para abrir o ChatModal
        setIsChatModalOpen(true);
    };

    const closeChatModal = () => { // Função para fechar o ChatModal
        setIsChatModalOpen(false);
    };

    const currentUrl = window.location.href;

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
        trash: trashIcon, // Ícone de delete
    };

    return (
        <>
            <div className="mobile-header">
                <div className="mobile-header-left">
                    {buttons.close && <HeaderButton icon={icons.close} onClick={handleBack} />}
                    {buttons.address && (
                        <HeaderButton 
                            icon={icons.address} 
                            onClick={openAddressModal} 
                            text={location.city ? `${location.city} - ${location.zip}` : "Atualizar local"} 
                        />
                    )}                    
                    {buttons.chat && <HeaderButton icon={icons.chat} onClick={openChatModal} />} {/* Abre o ChatModal */}
                </div>
                <div className={`mobile-header-title ${showSearch ? 'with-search' : ''}`}>
                    {showLogo && !showSearch && (
                        <img src={logo} alt="Logo" className="mobile-header-logo" />
                    )}
                    {showSearch && (
                        <div className="search-layout-wrapper">
                            <SearchLayout 
                                placeholder={searchPlaceholder} 
                                value={searchValue} 
                                onChange={onSearchChange}
                                onSubmit={onSearchSubmit}
                            />
                        </div>
                    )}
                    {!showLogo && !showSearch && (
                        <h1>{title}</h1>
                    )}
                </div>
                <div className="mobile-header-right">
                    {buttons.bag && <HeaderButton icon={icons.bag} link="/bag" />}
                    {buttons.share && <HeaderButton icon={icons.share} link="/share" />}
                    {buttons.search && <HeaderButton icon={icons.search} link="/search" />}
                    {buttons.back && <HeaderButton icon={icons.back} onClick={handleBack} />}
                    {buttons.settings && <HeaderButton icon={icons.settings} link="/settings" />}
                    {buttons.qrcode && <HeaderButton icon={icons.qrcode} onClick={openQRCodeModal} />}
                    {buttons.publish && <HeaderButton icon={icons.publish} link="/publish" />}
                    {buttons.scan && <HeaderButton icon={icons.scan} link="/scan" />}
                    {buttons.blocked && <HeaderButton icon={icons.blocked} link="/blocked" />}
                    {buttons.notifications && <HeaderButton icon={icons.notifications} link="/notifications" />}
                    {buttons.delete && <HeaderButton icon={icons.trash} onClick={onDelete} />} {/* Botão de delete */}
                </div>
            </div>
            <AddressModal isOpen={isAddressModalOpen} onClose={closeAddressModal} />
            <QRCodeModal 
                isOpen={isQRCodeModalOpen} 
                onClose={closeQRCodeModal} 
                url={currentUrl} 
                nickname={title} 
            />
            <ChatModal isOpen={isChatModalOpen} onClose={closeChatModal} /> {/* Adiciona o ChatModal */}
        </>
    );
};

MobileHeader.propTypes = {
    title: PropTypes.string,
    buttons: PropTypes.shape({
        address: PropTypes.bool,
        close: PropTypes.bool,
        chat: PropTypes.bool,
        bag: PropTypes.bool,
        share: PropTypes.bool,
        search: PropTypes.bool,
        back: PropTypes.bool,
        settings: PropTypes.bool,
        qrcode: PropTypes.bool,
        publish: PropTypes.bool,
        scan: PropTypes.bool,
        blocked: PropTypes.bool,
        notifications: PropTypes.bool,
        delete: PropTypes.bool, // Prop de delete
    }).isRequired,
    handleBack: PropTypes.func,
    showLogo: PropTypes.bool,
    showSearch: PropTypes.bool,
    searchPlaceholder: PropTypes.string,
    searchValue: PropTypes.string,
    onSearchChange: PropTypes.func,
    onSearchSubmit: PropTypes.func,
    onDelete: PropTypes.func, // Prop de função de delete
};

export default MobileHeader;
