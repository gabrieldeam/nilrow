package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.channel.about.About;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AboutRepository extends JpaRepository<About, String> {
    Optional<About> findByChannelId(String channelId);
}
