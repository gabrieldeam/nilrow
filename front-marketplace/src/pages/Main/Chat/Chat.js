import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import MobileHeader from '../../../components/Main/MobileHeader/MobileHeader';
import ChatModal from '../../../components/Others/ChatModal/ChatModal';
import { getConversations, getMessagesByConversation, sendMessage } from '../../../services/ChatApi';
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
                const response = await getConversations();
                setConversations(response);
            } catch (error) {
                console.error('Erro ao buscar conversas:', error);
            }
        };

        fetchConversations();
    }, []);

    const handleConversationSelect = async (conversation) => {
        setSelectedConversation(conversation);
        try {
            const response = await getMessagesByConversation(conversation.id);
            setMessages(response);
        } catch (error) {
            console.error('Erro ao buscar mensagens:', error);
        }
    };

    const handleSendMessage = async () => {
        if (selectedConversation && messageContent) {
            try {
                await sendMessage(selectedConversation.id, messageContent);
                const response = await getMessagesByConversation(selectedConversation.id);
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
                        <h2>Conversas</h2>
                        <button onClick={openChatModal}>Nova Conversa</button>
                    </div>
                    <div className="chat-list">
                        {conversations.map(conversation => (
                            <div
                                key={conversation.id}
                                className={`chat-list-item ${selectedConversation?.id === conversation.id ? 'selected' : ''}`}
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
                                    <div key={message.id} className="chat-message">
                                        <span>{message.senderName}:</span> {message.content}
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
