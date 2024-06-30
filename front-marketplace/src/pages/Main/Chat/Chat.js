import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import ChatModal from '../../../components/Others/ChatModal/ChatModal';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import Notification from '../../../components/UI/Notification/Notification';
import StageButton from '../../../components/UI/Buttons/StageButton/StageButton';
import { getConversations, getChannelConversations, getMessagesByConversation, sendMessage, deleteMessage, editMessage, countNewMessages, blockChannel, getBlockStatus, toggleMuteConversation, checkIfMuted, deleteConversation } from '../../../services/ChatApi';
import chatIcon from '../../../assets/chat.svg';
import settingsIcon from '../../../assets/settings.svg';
import closeIcon from '../../../assets/close.svg';
import blockIcon from '../../../assets/block.svg';
import muteIcon from '../../../assets/notifications.svg';
import deleteIcon from '../../../assets/trash.svg';
import userIcon from '../../../assets/user.png';
import getConfig from '../../../config';
import './Chat.css';

const { apiUrl, frontUrl } = getConfig();

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [showOptionsMessageId, setShowOptionsMessageId] = useState(null);
    const [editMessageId, setEditMessageId] = useState(null);
    const [notification, setNotification] = useState(null);
    const [showSettings, setShowSettings] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const isMobile = window.innerWidth <= 768;
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const closeConversation = useCallback(() => {
        setSelectedConversation(null);
        setMessages([]);
        navigate('/chat', { replace: true });
    }, [navigate]);

    const handleConversationSelect = useCallback(async (conversation) => {
        if (selectedConversation && selectedConversation.conversationId === conversation.conversationId) {
            return;
        }
        closeConversation();

        setSelectedConversation(conversation);
        navigate(`/chat?conversationId=${conversation.conversationId}`, { replace: true });

        try {
            const response = await getMessagesByConversation(conversation.conversationId);
            const sortedMessages = response.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
            setMessages(sortedMessages);

            const isBlockedStatus = await getBlockStatus(conversation.conversationId);
            const isMutedStatus = await checkIfMuted(conversation.conversationId);
            setIsBlocked(isBlockedStatus);
            setIsMuted(isMutedStatus);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        }
    }, [selectedConversation, navigate, closeConversation]);

    const fetchConversations = useCallback(async () => {
        try {
            const userConversations = await getConversations();
            const channelConversations = await getChannelConversations();

            const fetchLastMessageAndNewMessages = async (conversationId) => {
                const messages = await getMessagesByConversation(conversationId);
                const sortedMessages = messages.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
                const lastMessage = sortedMessages.length > 0 ? sortedMessages[sortedMessages.length - 1] : null;
                const newMessagesCount = await countNewMessages(conversationId);
                const isBlocked = await getBlockStatus(conversationId);
                return { lastMessage, newMessagesCount, isBlocked };
            };

            const combinedConversations = await Promise.all([
                ...userConversations.map(async convo => {
                    const { lastMessage, newMessagesCount, isBlocked } = await fetchLastMessageAndNewMessages(convo.conversationId);
                    return {
                        ...convo,
                        key: `user-${convo.conversationId}`,
                        lastMessage: lastMessage ? lastMessage.content : '',
                        lastMessageTime: lastMessage ? lastMessage.sentAt : null,
                        newMessagesCount: newMessagesCount || 0,
                        isBlocked: isBlocked,
                    };
                }),
                ...channelConversations.map(async convo => {
                    const { lastMessage, newMessagesCount, isBlocked } = await fetchLastMessageAndNewMessages(convo.conversationId);
                    return {
                        ...convo,
                        key: `channel-${convo.conversationId}`,
                        lastMessage: lastMessage ? lastMessage.content : '',
                        lastMessageTime: lastMessage ? lastMessage.sentAt : null,
                        newMessagesCount: newMessagesCount || 0,
                        isBlocked: isBlocked,
                    };
                }),
            ]);

            combinedConversations.sort((a, b) => {
                if (a.isBlocked === b.isBlocked) {
                    return b.newMessagesCount - a.newMessagesCount;
                }
                return a.isBlocked - b.isBlocked;
            });

            setConversations(combinedConversations);

            const params = new URLSearchParams(location.search);
            const conversationId = params.get('conversationId');
            if (conversationId) {
                const selectedConvo = combinedConversations.find(convo => convo.conversationId === conversationId);
                if (selectedConvo) {
                    handleConversationSelect(selectedConvo);
                }
            }
        } catch (error) {
            console.error('Erro ao buscar conversas:', error);
        }
    }, [location.search, handleConversationSelect]);

    useEffect(() => {
        fetchConversations();
        const intervalId = setInterval(fetchConversations, 1000);
        return () => clearInterval(intervalId);
    }, [fetchConversations]);

    const handleSendMessage = async () => {
        if (selectedConversation && messageContent) {
            if (messageContent.trim().length === 0) {
                setNotification('A mensagem não pode ser vazia ou conter apenas espaços em branco.');
                return;
            }

            if (messageContent.length > 500) {
                setNotification('A mensagem não pode ter mais de 500 caracteres.');
                return;
            }

            if (editMessageId) {
                await handleEditMessage(editMessageId, messageContent);
            } else {
                try {
                    await sendMessage(selectedConversation.conversationId, messageContent);
                    const response = await getMessagesByConversation(selectedConversation.conversationId);
                    const sortedMessages = response.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
                    setMessages(sortedMessages);
                    setMessageContent('');

                    setConversations(prevConversations =>
                        prevConversations.map(convo =>
                            convo.conversationId === selectedConversation.conversationId
                                ? { ...convo, lastMessage: messageContent.length > 50 ? `${messageContent.slice(0, 50)}...` : messageContent }
                                : convo
                        )
                    );
                } catch (error) {
                    setNotification(error.message);
                    console.error('Erro ao enviar mensagem:', error);
                }
            }
        }
    };

    const handleDeleteMessage = async (messageId) => {
        try {
            await deleteMessage(messageId);
            const response = await getMessagesByConversation(selectedConversation.conversationId);
            const sortedMessages = response.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Erro ao deletar mensagem:', error);
        }
    };

    const handleEditMessage = async (messageId, newContent) => {
        try {
            await editMessage(messageId, newContent);
            const response = await getMessagesByConversation(selectedConversation.conversationId);
            const sortedMessages = response.sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt));
            setMessages(sortedMessages);
            setMessageContent('');
            setEditMessageId(null);
        } catch (error) {
            console.error('Erro ao editar mensagem:', error);
        }
    };

    const openChatModal = () => {
        setIsChatModalOpen(true);
    };

    const closeChatModal = () => {
        setIsChatModalOpen(false);
    };

    const closeNotification = useCallback(() => {
        setNotification(null);
    }, []);

    const formatDateTime = (sentAt) => {
        const date = new Date(sentAt);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
    };

    const formatTime = (sentAt) => {
        const date = new Date(sentAt);
        const options = { hour: '2-digit', minute: '2-digit' };
        return date.toLocaleTimeString('pt-BR', options);
    };

    const handleScroll = () => {
        if (messagesContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
            const shouldScroll = scrollHeight - scrollTop <= clientHeight + 100;
            if (shouldScroll) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    const handleMessageClick = (message) => {
        if (message.sender && isRecentMessage(message.sentAt)) {
            setShowOptionsMessageId(message.id);
        } else {
            setShowOptionsMessageId(null);
        }
    };

    const isRecentMessage = (sentAt) => {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return new Date(sentAt) >= oneHourAgo;
    };

    const handleEditButtonClick = (message) => {
        setMessageContent(message.content);
        setEditMessageId(message.id);
        setShowOptionsMessageId(null);
    };

    const handleImageClick = (nickname) => {
        window.location.href = `${frontUrl}${nickname}`;
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    const handleCloseSettingsClick = () => {
        setShowSettings(false);
    };

    const handleBlockChannel = async () => {
        if (selectedConversation) {
            try {
                const responseMessage = await blockChannel(selectedConversation.conversationId);
                setNotification(responseMessage);
                const status = await getBlockStatus(selectedConversation.conversationId);
                setIsBlocked(status);
                setShowSettings(false);
            } catch (error) {
                setNotification(error.message);
                console.error('Erro ao bloquear canal:', error);
            }
        }
    };

    const handleMuteConversation = async () => {
        if (selectedConversation) {
            try {
                const responseMessage = await toggleMuteConversation(selectedConversation.conversationId);
                setNotification(responseMessage);
                const status = await checkIfMuted(selectedConversation.conversationId);
                setIsMuted(status);
            } catch (error) {
                setNotification(error.message);
                console.error('Erro ao silenciar conversa:', error);
            }
        }
    };

    const handleDeleteConversation = async () => {
        if (selectedConversation) {
            try {
                await deleteConversation(selectedConversation.conversationId);
                setNotification('Conversa excluída com sucesso.');
                closeConversation();
                setShowSettings(false);
            } catch (error) {
                setNotification(error.message);
                console.error('Erro ao excluir conversa:', error);
            }
        }
    };

    return (
        <div className="chat-page">
            <Helmet>
                <title>Chat</title>
                <meta name="description" content="oi" />
            </Helmet>
            {isMobile && (
                <MobileHeader
                    title="Mensagens"
                    buttons={{ chat: true }}
                />
            )}
            <div className={`chat-container ${isMobile && selectedConversation ? 'mobile-chat-active' : ''}`}>
                <div className={`chat-sidebar ${isMobile && selectedConversation ? 'mobile-hidden' : ''}`}>
                    <div className="chat-header">
                        <HeaderButton
                            icon={chatIcon}
                            onClick={openChatModal}
                        />
                        <h2 className="chat-header-title roboto-medium">Conversas</h2>                        
                    </div>
                    <div className="chat-list">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.key} 
                                className={`chat-list-item ${selectedConversation?.conversationId === conversation.conversationId ? (isBlocked ? 'selected-blocked' : 'selected') : ''}`}
                                onClick={() => handleConversationSelect(conversation)}
                            >
                                <img 
                                    src={conversation.imageUrl ? `${apiUrl}${conversation.imageUrl}` : userIcon} 
                                    alt="User Avatar" 
                                    style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '10px', cursor: 'pointer' }}
                                    onClick={() => handleImageClick(conversation.nickname)}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 'calc(100% - 60px)' }}>
                                    <span style={{ fontSize: '18px' }}>{conversation.name}</span>
                                    <span style={{ fontSize: '15px', color: '#aaa', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {conversation.lastMessage}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                    {conversation.isBlocked && (
                                        <span style={{
                                            backgroundColor: '#DF1414',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '5px',
                                            fontSize: '10px',
                                        }}>
                                            !
                                        </span>
                                    )}
                                    {conversation.newMessagesCount > 0 && (
                                        <span style={{
                                            backgroundColor: '#7B33E5',
                                            color: 'white',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '5px',
                                            fontSize: '10px',
                                        }}>
                                            {conversation.newMessagesCount}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '12px', color: '#aaa' }}>
                                        {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`chat-content ${isMobile && selectedConversation ? 'mobile-active' : ''}`}>
                    {showSettings ? (
                        <div className="settings-section">
                            <div className="close-icon-container">
                                <HeaderButton
                                    icon={closeIcon}
                                    onClick={handleCloseSettingsClick}
                                />
                            </div>
                            <div className="settings-content">
                                <div className="settings-header">
                                    <img
                                        src={selectedConversation.imageUrl ? `${apiUrl}${selectedConversation.imageUrl}` : userIcon}
                                        alt="User Avatar"
                                        className="settings-avatar"
                                    />
                                    <div className="settings-info">
                                        <span className="settings-name">{selectedConversation.name}</span>
                                        <span className="settings-nickname">@{selectedConversation.nickname}</span>
                                    </div>
                                    <div className="settings-actions">
                                        <StageButton
                                            text={isBlocked ? 'Desbloquear' : 'Bloquear'}
                                            backgroundColor="#DF1414"
                                            imageSrc={blockIcon}
                                            onClick={handleBlockChannel}
                                        />
                                        <StageButton
                                            text={isMuted ? 'Silenciado' : 'Silenciar'}
                                            backgroundColor="#DF1414"
                                            imageSrc={muteIcon}
                                            onClick={handleMuteConversation}
                                        />
                                        <StageButton
                                            text="Excluir chat"
                                            backgroundColor="#DF1414"
                                            imageSrc={deleteIcon}
                                            onClick={handleDeleteConversation}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : selectedConversation ? (
                        <>
                            <div className="chat-header-content">
                                <HeaderButton
                                    icon={closeIcon}
                                    onClick={closeConversation}
                                />
                                <img 
                                    src={selectedConversation.imageUrl ? `${apiUrl}${selectedConversation.imageUrl}` : userIcon} 
                                    alt="User Avatar" 
                                    style={{ width: '45px', height: '45px', borderRadius: '50%', marginLeft: '10px' }}
                                    onClick={() => handleImageClick(selectedConversation.nickname)}
                                />
                                <div className="conversation-info">
                                    <span className="conversation-name">{selectedConversation.name}</span>
                                    <span className="conversation-nickname">@{selectedConversation.nickname}</span>
                                </div>
                                <div style={{ marginLeft: 'auto' }}>
                                    <HeaderButton
                                        icon={settingsIcon}
                                        onClick={handleSettingsClick}
                                    />
                                </div>
                            </div>
                            <div className="chat-messages-background">
                                <div className="chat-messages" ref={messagesContainerRef} onScroll={handleScroll}>
                                    {messages.map(message => (
                                        <div
                                            key={message.id}
                                            className={`chat-message ${message.sender ? 'chat-message-sender' : 'chat-message-receiver'}`}
                                            onClick={() => handleMessageClick(message)}
                                        >
                                            <div className="message-content">
                                                {message.content}
                                                <div className="message-date">{formatDateTime(message.sentAt)}</div>
                                                <div className={`message-status ${message.sender ? 'sender-status' : 'receiver-status'}`}>
                                                    {message.seen ? 'Visto' : 'Enviada'}
                                                </div>
                                            </div>
                                            {showOptionsMessageId === message.id && (
                                                <div className="message-options">
                                                    <div className="delete-option" onClick={() => handleDeleteMessage(message.id)}>
                                                        Deletar
                                                    </div>
                                                    <div className="edit-option" onClick={() => handleEditButtonClick(message)}>
                                                        Editar
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    placeholder="Digite uma mensagem..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isBlocked}
                                />
                                <button 
                                    onClick={handleSendMessage} 
                                    disabled={isBlocked} 
                                    style={isBlocked ? { backgroundColor: '#DF1414' } : {}}
                                >
                                    {isBlocked ? 'Chat bloqueado' : editMessageId ? 'Editar' : 'Enviar'}
                                </button>
                            </div>
                        </>
                    ) : (
                        !isMobile && (
                            <div className="chat-placeholder">
                                <h2>Suas Mensagens</h2>
                                <p>Selecione uma conversa para enviar mensagens</p>
                            </div>
                        )
                    )}
                </div>
            </div>
            <ChatModal isOpen={isChatModalOpen} onClose={closeChatModal} />
            {notification && (
                <Notification message={notification} onClose={closeNotification} />
            )}
        </div>
    );
};

export default Chat;
