'use client';

import React, { useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { QRCodeModalProps } from '../../../types/components/Modals/QRCodeModal'; // Atualize o caminho conforme necessário
import styles from './QRCodeModal.module.css';

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, url, nickname, imageUrl }) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [qrColor, setQrColor] = useState('#000000');

  const handleDownload = () => {
    if (!qrCodeRef.current) return;

    toPng(qrCodeRef.current as HTMLElement, { filter: (node: HTMLElement) => node.tagName !== 'LINK' })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `${nickname}-qrcode.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error: unknown) => {
        console.error('Erro ao fazer download da imagem:', error);
      });
  };

  const handleColorChange = (color: string) => {
    setQrColor(color);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.qrcodeModalOverlay}>
      <div className={styles.qrcodeModal}>
        <button className={styles.qrcodeModalClose} onClick={onClose}>X</button>
        <div ref={qrCodeRef} className={styles.qrcodeContainer}>
          <QRCodeCanvas
            value={url}
            size={200}
            fgColor={qrColor}
            imageSettings={{
              src: imageUrl || '/assets/nilrowIcon.svg',
              x: undefined,
              y: undefined,
              height: 50,
              width: 50,
              excavate: true,
            }}
            level="H"
            includeMargin
          />
          <p className={styles.nickname}>{nickname}</p>
        </div>
        <p className={styles.instruction}>
          As pessoas podem ler o QR code com a câmera do smartphone para ver o canal.
        </p>
        <div className={styles.colorPicker}>
          <button
            className={styles.colorButton}
            style={{ backgroundColor: '#7B33E5' }}
            onClick={() => handleColorChange('#7B33E5')}
          />
          <button
            className={styles.colorButton}
            style={{ backgroundColor: '#FF5A21' }}
            onClick={() => handleColorChange('#FF5A21')}
          />
          <button
            className={styles.colorButton}
            style={{ backgroundColor: '#000000' }}
            onClick={() => handleColorChange('#000000')}
          />
        </div>
        <button className={styles.downloadButton} onClick={handleDownload}>
          Download QR Code
        </button>
      </div>
    </div>
  );
};

export default QRCodeModal;
