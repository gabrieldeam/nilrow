"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  MouseEvent,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import MobileHeader from "@/components/Layout/MobileHeader/MobileHeader";
import ChatModal from "@/components/Modals/ChatModal/ChatModal";
import HeaderButton from "@/components/UI/HeaderButton/HeaderButton";
import Notification from "@/components/UI/Notification/Notification";
import StageButton from "@/components/UI/StageButton/StageButton";

import chatIcon from "@/../public/assets/chat.svg";
import settingsIcon from "@/../public/assets/settings.svg";
import closeIcon from "@/../public/assets/close.svg";
import blockIcon from "@/../public/assets/block.svg";
import muteIcon from "@/../public/assets/notifications.svg";
import deleteIcon from "@/../public/assets/trash.svg";
import userImg from "@/../public/assets/user.png";
import globeIcon from "@/../public/assets/image-chat.svg";

import {
  ConversationChannelDTO,
  ConversationPeopleDTO,
  MessageDataDTO,
  UIBasicConversation,
  MessageData,
} from "@/types/services/chat";

import {
  getConversations,
  getChannelConversations,
  getMessagesByConversation,
  sendMessage,
  sendImage,
  deleteMessage,
  editMessage,
  countNewMessages,
  blockChannel,
  getBlockStatus,
  toggleMuteConversation,
  checkIfMuted,
  deleteConversation,
} from "@/services/chatService";

import styles from "./Chat.module.css";

function toImageUrl(icon: string | { src: string }): string {
  return typeof icon === "string" ? icon : icon.src;
}

const chatIconUrl = toImageUrl(chatIcon);
const settingsIconUrl = toImageUrl(settingsIcon);
const closeIconUrl = toImageUrl(closeIcon);
const blockIconUrl = toImageUrl(blockIcon);
const muteIconUrl = toImageUrl(muteIcon);
const deleteIconUrl = toImageUrl(deleteIcon);
const userIconUrl = toImageUrl(userImg);
const globeIconUrl = toImageUrl(globeIcon);

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
const frontUrl = process.env.NEXT_PUBLIC_FRONT_URL || "";

const ChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<UIBasicConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<UIBasicConversation | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [showOptionsMessageId, setShowOptionsMessageId] = useState<string | null>(null);
  const [editMessageId, setEditMessageId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  // Fecha a notificação (mesma lógica do React)
  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Fecha a conversa e reseta o estado
  const closeConversation = useCallback(() => {
    setSelectedConversation(null);
    setMessages([]);
    // Usar URLSearchParams para manipular a query string
    const params = new URLSearchParams(window.location.search);
    params.delete("conversationId");
    router.replace(`/chat?${params.toString()}`);
  }, [router]);

  // Seleciona uma conversa e carrega as mensagens
  const handleConversationSelect = useCallback(
    async (conversation: UIBasicConversation) => {
      // Evita recarregar se já está selecionada
      if (selectedConversation && selectedConversation.id === conversation.id) {
        return;
      }
      closeConversation();

      setSelectedConversation(conversation);
      const params = new URLSearchParams();
      params.set("conversationId", conversation.id);
      router.replace(`/chat?${params.toString()}`);

      try {
        const msgDTOs: MessageDataDTO[] = await getMessagesByConversation(conversation.id);
        msgDTOs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
        console.log('Mensagens recebidas da API:', msgDTOs);
        const mapped: MessageData[] = msgDTOs.map((m) => ({
          id: m.id,
          content: m.content,
          senderId: m.senderType,
          timestamp: m.sentAt,
          seen: m.seen,
          contentType: m.contentType ?? "text",
          isSender: m.isSender ?? false,
          sentAt: m.sentAt,
          senderType: m.senderType,
        }));
        setMessages(mapped);
        console.log('Mensagens recebidas e mapeadas:', mapped);

        // Verifica se está bloqueado
        const blocked = await getBlockStatus(conversation.id);
        setIsBlocked(blocked);

        // Verifica se está silenciado
        const muted = await checkIfMuted(conversation.id);
        setIsMuted(muted);
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
      }
    },
    [selectedConversation, closeConversation, router]
  );

  const buildUIBasicConversation = useCallback(
    async (dto: ConversationChannelDTO | ConversationPeopleDTO): Promise<UIBasicConversation> => {
      const base: UIBasicConversation = {
        id: dto.conversationId,
        name: dto.name || "",
        imageUrl: "imageUrl" in dto ? dto.imageUrl : undefined, // channels podem ter imageUrl
        nickname: dto.nickname || "",
        isBlocked: false,
        newMessagesCount: 0,
      };

      // Carrega última mensagem
      const msgDTOs = await getMessagesByConversation(base.id);
      msgDTOs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
      const lastMsg = msgDTOs.length > 0 ? msgDTOs[msgDTOs.length - 1] : undefined;

      // Conta quantas mensagens não lidas
      const newCount = await countNewMessages(base.id);

      // Verifica se está bloqueado
      const blocked = await getBlockStatus(base.id);

      return {
        ...base,
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              senderId: lastMsg.senderType,
              timestamp: lastMsg.sentAt,
              seen: lastMsg.seen,
              contentType: lastMsg.contentType,
              isSender: lastMsg.isSender ?? false,
              sentAt: lastMsg.sentAt,
              senderType: lastMsg.senderType,
            }
          : undefined,
        lastMessageTime: lastMsg ? lastMsg.sentAt : undefined,
        newMessagesCount: newCount,
        isBlocked: blocked,
      };
    },
    []
  );

  /**
   * Busca todas as conversas (pessoas e canais), monta o estado e se tiver
   * query param de conversa, já seleciona.
   */
  const fetchConversations = useCallback(async () => {
    try {
      const userConversations = await getConversations();
      const channelConversations = await getChannelConversations();

      const userMapped: UIBasicConversation[] = [];
      for (const c of userConversations) {
        const item = await buildUIBasicConversation(c);
        userMapped.push(item);
      }

      const channelMapped: UIBasicConversation[] = [];
      for (const c of channelConversations) {
        const item = await buildUIBasicConversation(c);
        channelMapped.push(item);
      }

      // Combina e ordena
      const combined = [...userMapped, ...channelMapped];

      // Ordena: não bloqueadas primeiro, e depois por maior newMessagesCount
      combined.sort((a, b) => {
        const aBlocked = a.isBlocked ? 1 : 0;
        const bBlocked = b.isBlocked ? 1 : 0;
        if (aBlocked === bBlocked) {
          // se ambos estiverem no mesmo status de bloqueio, maior contagem primeiro
          return (b.newMessagesCount || 0) - (a.newMessagesCount || 0);
        }
        return aBlocked - bBlocked; // não bloqueadas (0) antes de bloqueadas (1)
      });

      setConversations(combined);

      // Se tiver conversationId na URL, já abre
      if (!selectedConversation) {
        const params = new URLSearchParams(window.location.search);
        const conversationId = params.get("conversationId");

        if (conversationId) {
          const found = combined.find((cv) => cv.id === conversationId);
          if (found) {
            handleConversationSelect(found);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao buscar conversas:", error);
    }
  }, [buildUIBasicConversation, handleConversationSelect, selectedConversation]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchConversations();
    }, 1000);
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  // Detecta se é mobile
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.innerWidth <= 768);
    }
  }, []);

  // Faz polling das conversas a cada 1 segundo
  useEffect(() => {
    fetchConversations();
    const intervalId = setInterval(fetchConversations, 1000);
    return () => clearInterval(intervalId);
  }, [fetchConversations]);

  // Rolagem automática ao final quando chegam mensagens novas
  useEffect(() => {
    if (shouldScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldScroll, showSettings]);

  // Se fechamos a aba de configurações, voltamos a rolar
  useEffect(() => {
    if (!showSettings && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showSettings]);

  // ----------------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------------

  // Verifica se deve continuar auto-scrolling ao rolar as mensagens
  const handleMessagesScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const nearBottom = scrollHeight - scrollTop <= clientHeight + 100;
      setShouldScroll(nearBottom);
    }
  };

  // Abre/fecha modal de criação de nova conversa
  const openChatModal = () => setIsChatModalOpen(true);
  const closeChatModal = () => setIsChatModalOpen(false);

  // Envio de mensagem ou edição
  const handleSendMessage = async () => {
    if (!selectedConversation) return;

    // Validações
    if (messageContent.trim().length === 0 && !imageFile) {
      setNotification("A mensagem não pode ser vazia ou só espaços.");
      return;
    }
    if (messageContent.length > 500) {
      setNotification("A mensagem não pode ter mais de 500 caracteres.");
      return;
    }

    // Se estamos editando
    if (editMessageId) {
      await handleEditMessage(editMessageId, messageContent);
      return;
    }

    try {
      if (imageFile) {
        await sendImage(selectedConversation.id, imageFile);
        setImageFile(null);
        setMessageContent("");
      } else {
        await sendMessage(selectedConversation.id, messageContent);
        setMessageContent("");
      }

      // Recarrega as mensagens
      const msgDTOs = await getMessagesByConversation(selectedConversation.id);
      msgDTOs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

      const mapped: MessageData[] = msgDTOs.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderType,
        timestamp: m.sentAt,
        seen: m.seen,
        contentType: m.contentType,
        isSender: m.isSender ?? false,
        sentAt: m.sentAt,
        senderType: m.senderType,
      }));
      setMessages(mapped);
      setShouldScroll(true);

      // Atualiza última mensagem nessa conversa
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? {
                ...c,
                lastMessage: mapped[mapped.length - 1],
                lastMessageTime: mapped[mapped.length - 1]?.timestamp,
                newMessagesCount: 0,
              }
            : c
        )
      );
    } catch (error) {
      if (error instanceof Error) {
        setNotification(error.message);
      } else {
        setNotification("Erro ao enviar a mensagem.");
      }
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  // Deletar mensagem
  const handleDeleteMessage = async (messageId: string) => {
    if (!selectedConversation) return;
    try {
      await deleteMessage(messageId);

      // Atualiza lista de mensagens
      const msgDTOs = await getMessagesByConversation(selectedConversation.id);
      msgDTOs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

      const mapped: MessageData[] = msgDTOs.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderType,
        timestamp: m.sentAt,
        seen: m.seen,
        contentType: m.contentType,
        isSender: m.isSender ?? false,
        sentAt: m.sentAt,
        senderType: m.senderType,
      }));
      setMessages(mapped);
    } catch (error) {
      console.error("Erro ao deletar mensagem:", error);
    }
  };

  // Editar mensagem
  const handleEditMessage = async (messageId: string, newContent: string) => {
    if (!selectedConversation) return;
    try {
      await editMessage(messageId, newContent);

      // Recarrega mensagens
      const msgDTOs = await getMessagesByConversation(selectedConversation.id);
      msgDTOs.sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());

      const mapped: MessageData[] = msgDTOs.map((m) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderType,
        timestamp: m.sentAt,
        seen: m.seen,
        contentType: m.contentType,
        isSender: m.isSender ?? false,
        sentAt: m.sentAt,
        senderType: m.senderType,
      }));
      setMessages(mapped);

      // Sai do modo edição
      setMessageContent("");
      setEditMessageId(null);
    } catch (error) {
      console.error("Erro ao editar mensagem:", error);
    }
  };

  /**
   * Ao clicar na mensagem, mostra as opções de editar/deletar
   * SOMENTE se for do próprio usuário e se foi enviada há menos de 1 hora.
   */
  const handleMessageClick = (msg: MessageData) => {
    if (msg.isSender && isRecentMessage(msg.sentAt)) {
      setShowOptionsMessageId(msg.id);
    } else {
      setShowOptionsMessageId(null);
    }
  };

  // Verifica se a mensagem é recente (última 1 hora)
  const isRecentMessage = (sentAt: string) => {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return new Date(sentAt).getTime() >= oneHourAgo;
  };

  // Botão "Editar" no menu de opções
  const handleEditButtonClick = (msg: MessageData) => {
    setMessageContent(msg.content);
    setEditMessageId(msg.id);
    setShowOptionsMessageId(null);
  };

  // Clicou na imagem do user ou do canal
  const handleImageClick = (nickname?: string) => {
    if (nickname) {
      router.push(`${frontUrl}${nickname}`);
    }
  };

  // Pressionou Enter => Envia
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Abre/fecha painel de configurações (Bloquear, Silenciar, Excluir chat)
  const handleSettingsClick = () => setShowSettings(true);
  const handleCloseSettingsClick = () => setShowSettings(false);

  // Bloqueia ou desbloqueia
  const handleBlockChannel = async () => {
    if (!selectedConversation) return;
    try {
      const resp = await blockChannel(selectedConversation.id);
      setNotification(typeof resp === "string" ? resp : "Ação de bloqueio/desbloqueio executada.");

      const blocked = await getBlockStatus(selectedConversation.id);
      setIsBlocked(blocked);
      setShowSettings(false);
    } catch (error) {
      if (error instanceof Error) {
        setNotification(error.message);
      } else {
        setNotification("Erro ao bloquear canal/conversa.");
      }
      console.error("Erro ao bloquear:", error);
    }
  };

  // Silencia ou reativa notificação
  const handleMuteConversation = async () => {
    if (!selectedConversation) return;
    try {
      const resp = await toggleMuteConversation(selectedConversation.id);
      setNotification(typeof resp === "string" ? resp : "Silenciado/ativado com sucesso.");
      const muted = await checkIfMuted(selectedConversation.id);
      setIsMuted(muted);
    } catch (error) {
      if (error instanceof Error) {
        setNotification(error.message);
      } else {
        setNotification("Erro ao silenciar conversa.");
      }
      console.error("Erro ao silenciar:", error);
    }
  };

  // Exclui conversa inteira
  const handleDeleteConversation = async () => {
    if (!selectedConversation) return;
    try {
      await deleteConversation(selectedConversation.id);
      setNotification("Conversa excluída com sucesso.");
      closeConversation();
      setShowSettings(false);
    } catch (error) {
      if (error instanceof Error) {
        setNotification(error.message);
      } else {
        setNotification("Erro ao excluir conversa.");
      }
      console.error("Erro ao excluir conversa:", error);
    }
  };

  // Ao selecionar arquivo de imagem
  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      setMessageContent(e.target.files[0].name);
    }
  };

  // Formata data/hora (dd/mm/aaaa hh:mm)
  const formatDateTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString("pt-BR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formata apenas hora/minuto
  const formatTime = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ----------------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------------
  return (
    <div className={styles.chatPage}>
      {isMobile && <MobileHeader title="Mensagens" buttons={{ chat: true }} />}
      <div
        className={`${styles.chatContainer} ${
          isMobile && selectedConversation ? styles.mobileChatActive : ""
        }`}
      >
        <div
          className={`${styles.chatSidebar} ${
            isMobile && selectedConversation ? styles.mobileHidden : ""
          }`}
        >
          <div className={styles.chatHeader}>
            <HeaderButton icon={chatIconUrl} onClick={openChatModal} />
            <h2 className={styles.chatHeaderTitle}>Conversas</h2>
          </div>

          <div className={styles.chatList}>
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`${styles.chatListItem} ${
                  selectedConversation?.id === conversation.id
                    ? conversation.isBlocked
                      ? styles.selectedBlocked
                      : styles.selected
                    : ""
                }`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <Image
                  src={
                    conversation.imageUrl
                      ? `${apiUrl}${conversation.imageUrl}`
                      : userIconUrl
                  }
                  alt="User Avatar"
                  width={45}
                  height={45}
                  style={{ borderRadius: "50%", marginRight: "10px", cursor: "pointer" }}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    if (conversation.nickname) {
                      handleImageClick(conversation.nickname);
                    }
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', width: 'calc(100% - 60px)' }}>
                  <span style={{ fontSize: '18px' }}>{conversation.name ?? "Sem Nome"}</span>
                  <span style={{ fontSize: '15px', color: '#aaa', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {conversation.lastMessage?.content || ""}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  {conversation.isBlocked && (
                    <span className={styles.blockIndicator}>!</span>
                  )}
                  {conversation.newMessagesCount && conversation.newMessagesCount > 0 && (
                    <span className={styles.newMessagesIndicator}>
                      {conversation.newMessagesCount}
                    </span>
                  )}
                  <span className={styles.lastMessageTime}>
                    {conversation.lastMessageTime
                      ? formatTime(conversation.lastMessageTime)
                      : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conteúdo do chat (lado direito) */}
        <div
          className={`${styles.chatContent} ${
            isMobile && selectedConversation ? styles.mobileActive : ""
          }`}
        >
          {/* Se estiver no modo "configurações" */}
          {showSettings && selectedConversation ? (
            <div className={styles.settingsSection}>
              <div className={styles.closeIconContainer}>
                <HeaderButton icon={closeIconUrl} onClick={handleCloseSettingsClick} />
              </div>
              <div className={styles.settingsContent}>
                <div className={styles.settingsHeader}>
                  <Image
                    src={
                      selectedConversation.imageUrl
                        ? `${apiUrl}${selectedConversation.imageUrl}`
                        : userIconUrl
                    }
                    alt="User Avatar"
                    className={styles.settingsAvatar}
                    width={80}
                    height={80}
                  />
                  <div className={styles.settingsInfo}>
                    <span className={styles.settingsName}>
                      {selectedConversation.name ?? "Sem Nome"}
                    </span>
                    <span className={styles.settingsNickname}>
                      @{selectedConversation.nickname ?? "nickname"}
                    </span>
                  </div>
                  <div className={styles.settingsActions}>
                    <StageButton
                      text={isBlocked ? "Desbloquear" : "Bloquear"}
                      backgroundColor="#DF1414"
                      imageSrc={blockIconUrl}
                      onClick={handleBlockChannel}
                    />
                    <StageButton
                      text={isMuted ? "Silenciado" : "Silenciar"}
                      backgroundColor="#DF1414"
                      imageSrc={muteIconUrl}
                      onClick={handleMuteConversation}
                    />
                    <StageButton
                      text="Excluir chat"
                      backgroundColor="#DF1414"
                      imageSrc={deleteIconUrl}
                      onClick={handleDeleteConversation}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : selectedConversation ? (
            <>
              {/* Header da conversa */}
              <div className={styles.chatHeaderContent}>
                <HeaderButton icon={closeIconUrl} onClick={closeConversation} />
                <Image
                  src={selectedConversation.imageUrl ? `${apiUrl}${selectedConversation.imageUrl}` : userIconUrl}
                  alt="User Avatar"
                  width={45}
                  height={45}
                  style={{
                    minWidth: "45px",
                    minHeight: "45px",
                    borderRadius: "50%",
                    marginLeft: "10px",
                    marginRight: "10px",
                    cursor: "pointer",
                    objectFit: "cover",
                  }}
                  onClick={() => {
                    if (selectedConversation.nickname) {
                      handleImageClick(selectedConversation.nickname);
                    }
                  }}
                />
                <div className={styles.conversationInfo}>
                  <span className={styles.conversationName}>
                    {selectedConversation.name ?? "Sem Nome"}
                  </span>
                  <span className={styles.conversationNickname}>
                    @{selectedConversation.nickname ?? "nickname"}
                  </span>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <HeaderButton icon={settingsIconUrl} onClick={handleSettingsClick} />
                </div>
              </div>

              {/* Área de mensagens */}
              <div className={styles.chatMessagesBackground}>
                <div
                  className={styles.chatMessages}
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`${styles.chatMessage} ${msg.isSender ? styles['chat-message-sender'] : styles['chat-message-receiver']}`}
                      onClick={() => handleMessageClick(msg)}
                    >
                      <div className={styles['message-content']}>
                        {msg.contentType === "image" ? (
                          <Image
                            src={`${apiUrl}/${msg.content}`}
                            alt="Imagem enviada"
                            width={300}
                            height={300}
                            style={{ maxWidth: '200px', maxHeight: '200px' }}
                          />
                        ) : (
                          <span>{msg.content}</span>
                        )}
                        <div className={styles.messageDate}>
                          {formatDateTime(msg.timestamp)}
                        </div>
                        <div
                          className={`${styles.messageStatus} ${
                            msg.isSender ? styles.senderStatus : styles.receiverStatus
                          }`}
                        >
                          {msg.seen ? "Visto" : "Enviada"}
                        </div>
                      </div>

                      {showOptionsMessageId === msg.id && (
                        <div className={styles.messageOptions}>
                          <div
                            className={styles.deleteOption}
                            onClick={() => handleDeleteMessage(msg.id)}
                          >
                            Deletar
                          </div>
                          <div
                            className={styles.editOption}
                            onClick={() => handleEditButtonClick(msg)}
                          >
                            Editar
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {/* ref para rolar até o fim */}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input de mensagem */}
              <div className={styles.chatInput}>
                <input
                  type="text"
                  placeholder="Digite uma mensagem ou selecione uma imagem..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isBlocked}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label htmlFor="image-upload" className={styles.imageUploadLabel}>
                  <Image
                    src={globeIconUrl}
                    alt="Enviar imagem"
                    width={24}
                    height={24}
                    style={{ cursor: "pointer" }}
                  />
                </label>
                <button
                  onClick={handleSendMessage}
                  disabled={isBlocked}
                  style={isBlocked ? { backgroundColor: "#DF1414" } : {}}
                >
                  {isBlocked
                    ? "Chat bloqueado"
                    : editMessageId
                    ? "Editar"
                    : "Enviar"}
                </button>
              </div>
            </>
          ) : (
            // Placeholder se nenhuma conversa estiver selecionada (e não for mobile)
            !isMobile && (
              <div className={styles.chatPlaceholder}>
                <h2>Suas Mensagens</h2>
                <p>Selecione uma conversa para enviar mensagens</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Modal para criar novo chat */}
      <ChatModal isOpen={isChatModalOpen} onClose={closeChatModal} />

      {/* Notificação/Toast */}
      {notification && <Notification message={notification} onClose={closeNotification} />}
    </div>
  );
};

export default ChatPage;
