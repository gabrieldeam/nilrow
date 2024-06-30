package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.channel.about.About;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AboutRepository extends JpaRepository<About, Long> {
    Optional<About> findByChannel(Channel channel);
}
