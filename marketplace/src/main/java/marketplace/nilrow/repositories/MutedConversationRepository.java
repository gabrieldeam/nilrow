package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.chat.ChatConversation;
import marketplace.nilrow.domain.chat.MutedConversation;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MutedConversationRepository extends JpaRepository<MutedConversation, String> {
    Optional<MutedConversation> findByConversationAndPeople(ChatConversation conversation, People people);
}
