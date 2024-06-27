import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import ChatModal from '../../../components/Others/ChatModal/ChatModal';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton';
import { getConversations, getChannelConversations, getMessagesByConversation, sendMessage, markMessageAsSeen } from '../../../services/ChatApi';
import chatIcon from '../../../assets/chat.svg';
import settingsIcon from '../../../assets/settings.svg';
import closeIcon from '../../../assets/close.svg';
import userIcon from '../../../assets/user.png';
import getConfig from '../../../config';
import './Chat.css';

const { apiUrl } = getConfig();

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageContent, setMessageContent] = useState('');
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const userConversations = await getConversations();
                const channelConversations = await getChannelConversations();

                const fetchLastMessage = async (conversationId) => {
                    const messages = await getMessagesByConversation(conversationId);
                    const lastMessage = messages.length > 0 ? messages[messages.length - 1].content : '';
                    return lastMessage.length > 50 ? `${lastMessage.slice(0, 50)}...` : lastMessage;
                };

                const combinedConversations = await Promise.all([
                    ...userConversations.map(async convo => ({
                        ...convo,
                        key: `user-${convo.conversationId}`,
                        lastMessage: await fetchLastMessage(convo.conversationId),
                    })),
                    ...channelConversations.map(async convo => ({
                        ...convo,
                        key: `channel-${convo.conversationId}`,
                        lastMessage: await fetchLastMessage(convo.conversationId),
                    })),
                ]);

                setConversations(combinedConversations);
            } catch (error) {
                console.error('Erro ao buscar conversas:', error);
            }
        };

        fetchConversations();
    }, []);

    useEffect(() => {
        const markMessagesAsSeen = async () => {
            try {
                const receiverMessages = messages.filter(message => !message.sender);
                await Promise.all(receiverMessages.map(message => markMessageAsSeen(message.id)));
            } catch (error) {
                console.error('Erro ao marcar mensagens como vistas:', error);
            }
        };

        if (selectedConversation) {
            markMessagesAsSeen();
        }
    }, [messages, selectedConversation]);

    const handleConversationSelect = async (conversation) => {
        setSelectedConversation(conversation);
        try {
            const response = await getMessagesByConversation(conversation.conversationId);
            setMessages(response);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        }
    };

    const handleSendMessage = async () => {
        if (selectedConversation && messageContent) {
            try {
                await sendMessage(selectedConversation.conversationId, messageContent);
                const response = await getMessagesByConversation(selectedConversation.conversationId);
                setMessages(response);
                setMessageContent('');

                setConversations(prevConversations =>
                    prevConversations.map(convo =>
                        convo.conversationId === selectedConversation.conversationId
                            ? { ...convo, lastMessage: messageContent.length > 50 ? `${messageContent.slice(0, 50)}...` : messageContent }
                            : convo
                    )
                );
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    };

    const closeConversation = () => {
        setSelectedConversation(null);
        setMessages([]);
    };

    const openChatModal = () => {
        setIsChatModalOpen(true);
    };

    const closeChatModal = () => {
        setIsChatModalOpen(false);
    };

    const formatDateTime = (sentAt) => {
        const date = new Date(sentAt);
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return date.toLocaleDateString('pt-BR', options);
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
                    buttons={{ chat: true, settings: true }}
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
                        <HeaderButton
                            icon={settingsIcon}
                            link="/chat-settings"
                        />
                    </div>
                    <div className="chat-list">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.key} 
                                className={`chat-list-item ${selectedConversation?.conversationId === conversation.conversationId ? 'selected' : ''}`}
                                onClick={() => handleConversationSelect(conversation)}
                            >
                                <img 
                                    src={conversation.imageUrl ? `${apiUrl}${conversation.imageUrl}` : userIcon} 
                                    alt="User Avatar" 
                                    style={{ width: '45px', height: '45px', borderRadius: '50%', marginRight: '10px' }}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '18px' }}>{conversation.name}</span>
                                    <span style={{ fontSize: '15px', color: '#aaa' }}>{conversation.lastMessage}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={`chat-content ${isMobile && selectedConversation ? 'mobile-active' : ''}`}>
                    {selectedConversation && (
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
                                />
                                <span style={{ fontSize: '18px', marginLeft: '10px' }}>{selectedConversation.name}</span>
                                <div style={{ marginLeft: 'auto' }}>
                                    <HeaderButton
                                        icon={settingsIcon}
                                        link="/chat-settings"
                                    />
                                </div>
                            </div>
                            <div className="chat-messages">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`chat-message ${message.sender ? 'chat-message-sender' : 'chat-message-receiver'}`}
                                    >
                                        <div className="message-content">
                                            {message.content}
                                            <div className="message-date">{formatDateTime(message.sentAt)}</div>
                                            <div className={`message-status ${message.sender ? 'sender-status' : 'receiver-status'}`}>
                                                {message.seen ? 'Visto' : 'Enviada'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="chat-input">
                                <input
                                    type="text"
                                    placeholder="Digite uma mensagem..."
                                    value={messageContent}
                                    onChange={(e) => setMessageContent(e.target.value)}
                                />
                                <button onClick={handleSendMessage}>Enviar</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <ChatModal isOpen={isChatModalOpen} onClose={closeChatModal} />
        </div>
    );
};

export default Chat;
