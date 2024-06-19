package marketplace.nilrow.services;

import marketplace.nilrow.domain.follow.Follow;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.repositories.FollowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    public Optional<Follow> followChannel(People follower, Channel channel) {
        if (followRepository.findByFollowerAndChannel(follower, channel).isPresent()) {
            throw new IllegalArgumentException("Already following this channel");
        }
        Follow follow = new Follow(null, follower, channel);
        return Optional.of(followRepository.save(follow));
    }

    public void unfollowChannel(People follower, Channel channel) {
        followRepository.deleteByFollowerAndChannel(follower, channel);
    }

    public boolean isFollowing(People follower, Channel channel) {
        return followRepository.findByFollowerAndChannel(follower, channel).isPresent();
    }

    public long getFollowersCount(Channel channel) {
        return followRepository.countByChannel(channel);
    }
}
