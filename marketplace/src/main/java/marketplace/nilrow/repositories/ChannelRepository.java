package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, String> {
    Optional<Channel> findByPeople(People people);
    Optional<Channel> findByPeopleUserNickname(String nickname);
}
