package marketplace.nilrow.services;

import marketplace.nilrow.domain.chat.ChatConversation;
import marketplace.nilrow.domain.chat.ChatMessage;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.ChatConversationRepository;
import marketplace.nilrow.repositories.ChatMessageRepository;
import marketplace.nilrow.repositories.ChannelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChatService {

    @Autowired
    private ChatConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private ChannelRepository channelRepository;

    public ChatConversation startConversation(Channel channel, People people) {
        // Verifique se a conversa já existe
        Optional<ChatConversation> existingConversation = conversationRepository.findByChannelAndPeople(channel, people);
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }

        // Crie uma nova conversa
        ChatConversation conversation = new ChatConversation(null, channel, people, null, false, false, false);
        return conversationRepository.save(conversation);
    }

    public ChatMessage sendMessage(ChatConversation conversation, Object sender, String content) {
        ChatMessage message;
        if (sender instanceof People) {
            message = new ChatMessage(conversation, (People) sender, content, LocalDateTime.now(), false);
        } else if (sender instanceof Channel) {
            message = new ChatMessage(conversation, (Channel) sender, content, LocalDateTime.now(), false);
        } else {
            throw new IllegalArgumentException("Sender must be either People or Channel");
        }
        return messageRepository.save(message);
    }

    public void deleteMessage(String messageId) {
        messageRepository.deleteById(messageId);
    }

    public void editMessage(String messageId, String newContent) {
        ChatMessage message = messageRepository.findById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setContent(newContent);
        messageRepository.save(message);
    }

    public void deleteConversation(String conversationId) {
        conversationRepository.deleteById(conversationId);
    }

    public long countNewMessages(ChatConversation conversation) {
        return messageRepository.countByConversationAndSeenFalse(conversation);
    }

    public void markMessageAsSeen(String messageId) {
        ChatMessage message = messageRepository.findById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setSeen(true);
        messageRepository.save(message);
    }

    public void blockChannel(ChatConversation conversation) {
        conversation.setBlocked(true);
        conversationRepository.save(conversation);
    }

    public void disableChat(ChatConversation conversation) {
        conversation.setChatDisabled(true);
        conversationRepository.save(conversation);
    }

    public List<ChatConversation> getConversationsByPeople(People people) {
        return conversationRepository.findByPeople(people);
    }

    public List<ChatConversation> getConversationsByChannel(Channel channel) {
        return conversationRepository.findByChannel(channel);
    }

    public Optional<ChatConversation> getConversation(String conversationId) {
        return conversationRepository.findById(conversationId);
    }

    public Optional<ChatMessage> getMessage(String messageId) {
        return messageRepository.findById(messageId);
    }

    public List<Channel> getAllChannels() {
        return channelRepository.findAll();
    }

    public List<ChatMessage> getMessagesByConversation(ChatConversation conversation) {
        return messageRepository.findByConversation(conversation);
    }

    public void markMessagesAsRead(ChatConversation conversation) {
        List<ChatMessage> messages = messageRepository.findByConversation(conversation);
        for (ChatMessage message : messages) {
            message.setSeen(true);
        }
        messageRepository.saveAll(messages);
    }

    public void muteConversation(ChatConversation conversation) {
        conversation.setMuted(true);
        conversationRepository.save(conversation);
    }

    public List<ChatMessage> searchMessages(ChatConversation conversation, String query) {
        return messageRepository.findByConversationAndContentContaining(conversation, query);
    }

    public List<Channel> getChannelsWithConversations(People people) {
        List<ChatConversation> conversations = conversationRepository.findByPeople(people);
        return conversations.stream()
                .map(ChatConversation::getChannel)
                .collect(Collectors.toList());
    }
}