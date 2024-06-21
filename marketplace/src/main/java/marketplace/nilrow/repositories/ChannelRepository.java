package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface ChannelRepository extends JpaRepository<Channel, String> {
    Optional<Channel> findByPeople(People people);
    Optional<Channel> findByPeopleUserNickname(String nickname);
    Optional<Channel> findByIdAndActiveTrue(String id);
}
