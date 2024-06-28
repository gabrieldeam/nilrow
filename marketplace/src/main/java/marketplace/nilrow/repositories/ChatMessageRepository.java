package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.chat.ChatMessage;
import marketplace.nilrow.domain.chat.ChatConversation;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    List<ChatMessage> findByConversation(ChatConversation conversation);
    long countByConversationAndSeenFalse(ChatConversation conversation);
    List<ChatMessage> findByConversationAndContentContaining(ChatConversation conversation, String content);
    long countByConversationAndSeenFalseAndSenderPeopleNot(ChatConversation conversation, People senderPeople);
    long countByConversationAndSeenFalseAndSenderChannelNot(ChatConversation conversation, Channel senderChannel);
}
