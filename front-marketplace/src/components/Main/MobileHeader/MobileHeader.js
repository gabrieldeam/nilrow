import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import './MobileHeader.css';

const MobileHeader = ({ title, buttons }) => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const icons = {
        address: '../../../assets/address.svg',
        close: '../../../assets/close.svg',
        chat: '../../../assets/chat.svg',
        bag: '../../../assets/bag.svg',
        share: '../../../assets/share.svg',
        search: '../../../assets/search.svg',
        back: '../../../assets/setadireito.svg',
        settings: '../../../assets/settings.svg',
        qrcode: '../../../assets/qrcode.svg',
        publish: '../../../assets/publish.svg',
        scan: '../../../assets/scan.svg',
        blocked: '../../../assets/blocked.svg',
        notifications: '../../../assets/notifications.svg',
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
};

export default MobileHeader;
