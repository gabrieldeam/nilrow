package marketplace.nilrow.services;

import marketplace.nilrow.domain.chat.ChatConversation;
import marketplace.nilrow.domain.chat.ChatMessage;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.chat.MutedConversation;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.ChatConversationRepository;
import marketplace.nilrow.repositories.ChatMessageRepository;
import marketplace.nilrow.repositories.ChannelRepository;
import marketplace.nilrow.repositories.MutedConversationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @Autowired
    private MutedConversationRepository mutedConversationRepository;

    private static final String UPLOAD_DIR = "uploads/";

    public ChatConversation startConversation(Channel channel, People people) {
        Optional<ChatConversation> existingConversation = conversationRepository.findByChannelAndPeople(channel, people);
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }

        ChatConversation conversation = new ChatConversation(null, channel, people, null, false, false, null);
        return conversationRepository.save(conversation);
    }


    public ChatMessage sendMessage(ChatConversation conversation, Object sender, String content, String contentType) {
        ChatMessage message;
        if (sender instanceof People) {
            message = new ChatMessage(conversation, (People) sender, content, LocalDateTime.now(), false, contentType);
        } else if (sender instanceof Channel) {
            message = new ChatMessage(conversation, (Channel) sender, content, LocalDateTime.now(), false, contentType);
        } else {
            throw new IllegalArgumentException("Sender must be either People or Channel");
        }
        return messageRepository.save(message);
    }

    public Optional<ChatMessage> getMessageById(String messageId) {
        return messageRepository.findById(messageId);
    }

    public String saveFile(MultipartFile file) {
        try {
            // Certifique-se de que o diretório de upload existe
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Salve o arquivo
            Path filePath = Paths.get(UPLOAD_DIR + file.getOriginalFilename());
            Files.write(filePath, file.getBytes());

            // Retorne o caminho ou URL do arquivo salvo
            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save file", e);
        }
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
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found"));

        List<ChatMessage> messages = messageRepository.findByConversation(conversation);

        for (ChatMessage message : messages) {
            if ("image".equals(message.getContentType())) {
                Path imagePath = Paths.get(message.getContent());
                try {
                    if (Files.exists(imagePath)) {
                        Files.delete(imagePath);
                    }
                } catch (IOException e) {
                    e.printStackTrace(); // Imprime o erro na saída padrão para depuração
                }
            }
            messageRepository.delete(message);
        }

        conversationRepository.delete(conversation);
    }

    public long countNewMessagesForUser(ChatConversation conversation, People user) {
        long countFromPeople = messageRepository.countByConversationAndSeenFalseAndSenderPeopleNot(conversation, user);
        long countFromChannel = 0;
        if (user.getChannel() != null) {
            countFromChannel = messageRepository.countByConversationAndSeenFalseAndSenderChannelNot(conversation, user.getChannel());
        }
        return countFromPeople + countFromChannel;
    }

    public void markMessageAsSeen(String messageId) {
        ChatMessage message = messageRepository.findById(messageId).orElseThrow(() -> new IllegalArgumentException("Message not found"));
        message.setSeen(true);
        messageRepository.save(message);
    }

    public boolean toggleBlockChannel(ChatConversation conversation, People requester) {
        if (conversation.isBlocked()) {
            if (conversation.getBlockedBy().equals(requester)) {
                conversation.setBlocked(false);
                conversation.setBlockedBy(null);
                conversationRepository.save(conversation);
                return false;
            } else {
                throw new IllegalStateException("Somente a pessoa que bloqueou a conversa pode desbloqueá-la.");
            }
        } else {
            conversation.setBlocked(true);
            conversation.setBlockedBy(requester);
            conversationRepository.save(conversation);
            return true;
        }
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

    public void toggleMuteConversation(ChatConversation conversation, People requester) {
        Optional<MutedConversation> mutedConversationOpt = mutedConversationRepository.findByConversationAndPeople(conversation, requester);

        if (mutedConversationOpt.isPresent()) {
            mutedConversationRepository.delete(mutedConversationOpt.get());
        } else {
            MutedConversation mutedConversation = new MutedConversation(null, conversation, requester);
            mutedConversationRepository.save(mutedConversation);
        }
    }

    public boolean isConversationMutedByUser(ChatConversation conversation, People requester) {
        return mutedConversationRepository.findByConversationAndPeople(conversation, requester).isPresent();
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

    public List<ChatConversation> getBlockedConversations(People people) {
        List<ChatConversation> blockedConversations = conversationRepository.findByPeopleAndBlockedTrue(people);
        if (people.getChannel() != null) {
            blockedConversations.addAll(conversationRepository.findByChannel_PeopleAndBlockedTrue(people));
        }
        return blockedConversations;
    }
}
