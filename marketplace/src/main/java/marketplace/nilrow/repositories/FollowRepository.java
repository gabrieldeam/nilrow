package marketplace.nilrow.repositories;

import marketplace.nilrow.domain.follow.Follow;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.channel.Channel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, String> {
    Optional<Follow> findByFollowerAndChannel(People follower, Channel channel);
    void deleteByFollowerAndChannel(People follower, Channel channel);
    long countByChannel(Channel channel);
    long countByFollower(People follower);
    List<Follow> findByChannel(Channel channel);
    List<Follow> findByFollower(People follower);
    Page<Follow> findByChannel(Channel channel, Pageable pageable);
    Page<Follow> findByFollower(People follower, Pageable pageable);
}
