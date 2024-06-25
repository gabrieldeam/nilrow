import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import ChatModal from '../../../components/Others/ChatModal/ChatModal';
import HeaderButton from '../../../components/UI/Buttons/HeaderButton/HeaderButton'; // Importe o HeaderButton
import { getConversations, getChannelConversations, getMessagesByConversation, sendMessage } from '../../../services/ChatApi';
import chatIcon from '../../../assets/chat.svg'; // Importe a imagem chat.svg
import settingsIcon from '../../../assets/settings.svg'; // Importe a imagem settings.svg
import './Chat.css';

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
                const combinedConversations = [
                    ...userConversations.map(convo => ({ ...convo, key: `user-${convo.conversationId}` })),
                    ...channelConversations.map(convo => ({ ...convo, key: `channel-${convo.conversationId}` }))
                ];
                setConversations(combinedConversations);
            } catch (error) {
                console.error('Erro ao buscar conversas:', error);
            }
        };

        fetchConversations();
    }, []);

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
            } catch (error) {
                console.error('Erro ao enviar mensagem:', error);
            }
        }
    };

    const openChatModal = () => {
        setIsChatModalOpen(true);
    };

    const closeChatModal = () => {
        setIsChatModalOpen(false);
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
            <div className="chat-container">
                <div className="chat-sidebar">
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
                                key={conversation.key} // Garantindo chave única
                                className={`chat-list-item ${selectedConversation?.conversationId === conversation.conversationId ? 'selected' : ''}`}
                                onClick={() => handleConversationSelect(conversation)}
                            >
                                {conversation.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="chat-content">
                    {selectedConversation ? (
                        <>
                            <div className="chat-messages">
                                {messages.map(message => (
                                    <div
                                        key={message.id}
                                        className={`chat-message ${message.sender ? 'chat-message-sender' : 'chat-message-receiver'}`}
                                    >
                                        <div className="message-content">
                                            <span>{message.senderType}:</span> {message.content}
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
                    ) : (
                        <div className="chat-placeholder">
                            Selecione uma conversa para começar
                        </div>
                    )}
                </div>
            </div>
            <ChatModal isOpen={isChatModalOpen} onClose={closeChatModal} />
        </div>
    );
};

export default Chat;
