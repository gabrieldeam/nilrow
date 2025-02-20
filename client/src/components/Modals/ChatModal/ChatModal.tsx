'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChatModalProps, Channel } from '../../../types/components/Modals/ChatModal';
import HeaderButton from '../../UI/HeaderButton/HeaderButton';
import StageButton from '../../UI/StageButton/StageButton';
import { listChannels, startConversation } from '../../../services/chatService';
import closeIcon from '../../../../public/assets/close.svg';
import userIcon from '../../../../public/assets/user.png';
import styles from './ChatModal.module.css';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messageContent, setMessageContent] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchChannels = async () => {
        try {
          const response = await listChannels();          
          const transformedChannels = response.map((channel: any) => ({
            ...channel,
            nickname: channel.nickname || 'unknown', 
          }));
          setChannels(transformedChannels);
        } catch (error) {
          console.error('Erro ao buscar canais:', error);
        }
      };

      fetchChannels();
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleSendMessage = async () => {
    if (selectedChannel && messageContent) {
      try {
        await startConversation(selectedChannel.id, messageContent);
        onClose();
      } catch (error) {
        console.error('Erro ao iniciar conversa:', error);
      }
    }
  };

  const filteredChannels = channels.filter(
    (channel) =>
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.nickname.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.container}>
        <div className={styles.closeButtonWrapper}>
          <HeaderButton icon={closeIcon} onClick={onClose} />
        </div>
        <h2 className={styles.title}>Iniciar Conversa</h2>
        <input
          type="text"
          placeholder="Buscar canais..."
          value={searchQuery}
          onChange={handleSearchChange}
          className={styles.searchInput}
        />
        <div className={styles.channels}>
          {filteredChannels.map((channel) => (
            <div
              key={channel.id}
              className={`${styles.channelItem} ${
                selectedChannel?.id === channel.id ? styles.selected : ''
              }`}
              onClick={() => handleChannelSelect(channel)}
            >
              <Image
                src={`${apiUrl}${channel.imageUrl}` || userIcon}
                alt="Channel Avatar"
                width={45}
                height={45}
                className={styles.avatar}
              />
              <div className={styles.channelInfo}>
                <span className={styles.channelName}>{channel.name}</span>
                <span className={styles.channelNickname}>@{channel.nickname}</span>
              </div>
            </div>
          ))}
        </div>
        {selectedChannel && (
          <div className={styles.message}>
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className={styles.messageInput}
            />
            <StageButton text="Enviar" backgroundColor="#7B33E5" onClick={handleSendMessage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
