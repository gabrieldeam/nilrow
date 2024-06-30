import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './ChatModal.css';
import { listChannels, startConversation } from '../../../services/ChatApi';
import HeaderButton from '../../UI/Buttons/HeaderButton/HeaderButton';
import StageButton from '../../UI/Buttons/StageButton/StageButton';
import closeIcon from '../../../assets/close.svg';
import userIcon from '../../../assets/user.png';
import getConfig from '../../../config';

const { apiUrl } = getConfig();

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
                    {window.innerWidth <= 768 ? (
                        <HeaderButton icon={closeIcon} onClick={onClose} />
                    ) : (
                        <img
                            src={closeIcon}
                            alt="Close Icon"
                            onClick={onClose}
                            style={{ cursor: 'pointer', width: '24px', height: '24px' }}
                        />
                    )}
                </div>
                <h2 className="chat-modal-title roboto-medium">Iniciar Conversa</h2>
                <input 
                    type="text" 
                    placeholder="Buscar canais..." 
                    value={searchQuery} 
                    onChange={handleSearchChange}
                    className="chat-modal-search-input"
                />
                <div className="chat-modal-channels">
                    {filteredChannels.map(channel => (
                        <div
                            key={channel.id}
                            className={`chat-modal-channel-item ${selectedChannel?.id === channel.id ? 'selected' : ''}`}
                            onClick={() => handleChannelSelect(channel)}
                        >
                            <img 
                                src={channel.imageUrl ? `${apiUrl}${channel.imageUrl}` : userIcon} 
                                alt="Channel Avatar" 
                                style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '10px', cursor: 'pointer' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 'calc(100% - 60px)' }}>
                                <span style={{ fontSize: '18px' }}>{channel.name}</span>
                                <span style={{ fontSize: '15px', color: '#aaa', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    @{channel.nickname}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {selectedChannel && (
                    <div className="chat-modal-message">
                        <input
                            type="text"
                            placeholder="Digite sua mensagem..."
                            value={messageContent}
                            onChange={(e) => setMessageContent(e.target.value)}
                            className="chat-modal-message-input"
                        />
                        <StageButton
                            text="Enviar"
                            backgroundColor="#7B33E5"
                            onClick={handleSendMessage}
                        />
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
