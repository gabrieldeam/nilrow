package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.chat.ChatConversation;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, String> {
    Optional<ChatConversation> findByChannelAndPeople(Channel channel, People people);
    List<ChatConversation> findByPeople(People people);
    List<ChatConversation> findByChannel(Channel channel);
    List<ChatConversation> findByPeopleAndBlockedTrue(People people);
    List<ChatConversation> findByChannel_PeopleAndBlockedTrue(People people);
}
