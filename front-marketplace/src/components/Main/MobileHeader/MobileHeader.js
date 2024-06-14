import React from 'react';
import PropTypes from 'prop-types';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import './MobileHeader.css';

// Import icons directly
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

const MobileHeader = ({ title, buttons, handleBack }) => {
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
    };

    return (
        <div className="mobile-header">
            <div className="mobile-header-left">
                {buttons.address && <HeaderButton icon={icons.address} link="/address" />}
                {buttons.close && <HeaderButton icon={icons.close} onClick={handleBack} />}
                {buttons.chat && <HeaderButton icon={icons.chat} link="/chat" />}
            </div>
            <div className="mobile-header-title">
                <h1>{title}</h1>
            </div>
            <div className="mobile-header-right">
                {buttons.bag && <HeaderButton icon={icons.bag} link="/bag" />}
                {buttons.share && <HeaderButton icon={icons.share} link="/share" />}
                {buttons.search && <HeaderButton icon={icons.search} link="/search" />}
                {buttons.back && <HeaderButton icon={icons.back} onClick={handleBack} />}
                {buttons.settings && <HeaderButton icon={icons.settings} link="/settings" />}
                {buttons.qrcode && <HeaderButton icon={icons.qrcode} link="/qrcode" />}
                {buttons.publish && <HeaderButton icon={icons.publish} link="/publish" />}
                {buttons.scan && <HeaderButton icon={icons.scan} link="/scan" />}
                {buttons.blocked && <HeaderButton icon={icons.blocked} link="/blocked" />}
                {buttons.notifications && <HeaderButton icon={icons.notifications} link="/notifications" />}
            </div>
        </div>
    );
};

MobileHeader.propTypes = {
    title: PropTypes.string.isRequired,
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
    }).isRequired,
    handleBack: PropTypes.func,
};

export default MobileHeader;
