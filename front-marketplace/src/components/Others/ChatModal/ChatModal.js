import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ChatModal.css';
import { listChannels, startConversation } from '../../../services/ChatApi';
import CustomInput from '../../UI/CustomInput/CustomInput';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import closeIcon from '../../../assets/close.svg';
import CustomButton from '../../UI/Buttons/CustomButton/CustomButton';

const ChatModal = ({ isOpen, onClose }) => {
    const [channels, setChannels] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [messageContent, setMessageContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            const fetchChannels = async () => {
                try {
                    const response = await listChannels();
                    setChannels(response);
                } catch (error) {
                    console.error('Erro ao buscar canais:', error);
                }
            };

            fetchChannels();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('body-no-scroll');
        } else {
            document.body.classList.remove('body-no-scroll');
        }

        return () => {
            document.body.classList.remove('body-no-scroll');
        };
    }, [isOpen]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleChannelSelect = (channel) => {
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

    const filteredChannels = channels.filter(channel =>
        channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        channel.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOverlayClick = (e) => {
        if (e.target.classList.contains('chat-modal-overlay')) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="chat-modal-overlay" onClick={handleOverlayClick}>
            <div className="chat-modal-container">
                <div className="chat-modal-close-button-wrapper">
                    <HeaderButton icon={closeIcon} onClick={onClose} />
                </div>
                <h2 className="chat-modal-title roboto-medium">Iniciar Conversa</h2>
                <CustomInput
                    placeholder="Buscar canais..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
                <div className="chat-modal-channels">
                    {filteredChannels.map(channel => (
                        <div
                            key={channel.id}
                            className={`chat-modal-channel-item ${selectedChannel?.id === channel.id ? 'selected' : ''}`}
                            onClick={() => handleChannelSelect(channel)}
                        >
                            {channel.name} (@{channel.nickname})
                        </div>
                    ))}
                </div>
                {selectedChannel && (
                    <div className="chat-modal-message">
                        <CustomInput
                            placeholder="Digite sua mensagem..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                        />
                        <CustomButton title="Enviar" onClick={handleSendMessage} />
                    </div>
                )}
            </div>
        </div>
    );
};

ChatModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default ChatModal;
