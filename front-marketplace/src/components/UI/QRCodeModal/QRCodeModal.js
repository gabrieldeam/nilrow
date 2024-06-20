import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import './QRCodeModal.css';
import logo from '../../../assets/nilrowIcon.svg';

const QRCodeModal = ({ isOpen, onClose, url, nickname, imageUrl }) => {
    const qrCodeRef = useRef();
    const [qrColor, setQrColor] = useState('#000000');

    const handleDownload = () => {
        toPng(qrCodeRef.current, { filter: (node) => node.tagName !== 'LINK' })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `${nickname}-qrcode.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((error) => {
                console.error('Erro ao fazer download da imagem:', error);
            });
    };

    const handleColorChange = (color) => {
        setQrColor(color);
    };

    if (!isOpen) return null;

    return (
        <div className="qrcode-modal-overlay">
            <div className="qrcode-modal">
                <button className="qrcode-modal-close" onClick={onClose}>X</button>
                <div ref={qrCodeRef} className="qrcode-container" style={{ padding: '10px' }}>
                    <QRCodeCanvas 
                        value={url} 
                        size={200} 
                        fgColor={qrColor} 
                        imageSettings={{
                            src: imageUrl || logo,
                            x: null,
                            y: null,
                            height: 50,
                            width: 50,
                            excavate: true,
                        }}
                        level={"H"}
                        includeMargin={true}
                    />
                    <p className="nickname">{nickname}</p>
                </div>
                <p className="instruction">As pessoas podem ler o QR code com a câmera do smartphone para ver o canal</p>
                <div className="color-picker">
                    <button 
                        className="color-button" 
                        style={{ backgroundColor: '#7B33E5' }} 
                        onClick={() => handleColorChange('#7B33E5')}
                    />
                    <button 
                        className="color-button" 
                        style={{ backgroundColor: '#FF5A21' }} 
                        onClick={() => handleColorChange('#FF5A21')}
                    />
                    <button 
                        className="color-button" 
                        style={{ backgroundColor: '#000000' }} 
                        onClick={() => handleColorChange('#000000')}
                    />
                </div>
                <button className="download-button" onClick={handleDownload}>Download QR Code</button>
            </div>
        </div>
    );
};

QRCodeModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    url: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    imageUrl: PropTypes.string,
};

export default QRCodeModal;
