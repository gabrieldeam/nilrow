package marketplace.nilrow.services;

import marketplace.nilrow.domain.follow.Follow;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.repositories.FollowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FollowService {

    @Autowired
    private FollowRepository followRepository;

    @Transactional
    public void followChannel(People follower, Channel channel) {
        if (followRepository.findByFollowerAndChannel(follower, channel).isPresent()) {
            throw new IllegalArgumentException("Already following this channel");
        }
        Follow follow = new Follow(null, follower, channel);
        followRepository.save(follow);
    }

    @Transactional
    public void unfollowChannel(People follower, Channel channel) {
        followRepository.deleteByFollowerAndChannel(follower, channel);
    }

    public boolean isFollowing(People follower, Channel channel) {
        return followRepository.findByFollowerAndChannel(follower, channel).isPresent();
    }

    public long getFollowersCount(Channel channel) {
        return followRepository.countByChannel(channel);
    }

    public List<People> getFollowers(Channel channel, Pageable pageable) {
        return followRepository.findByChannel(channel, pageable).stream()
                .map(Follow::getFollower)
                .collect(Collectors.toList());
    }

    public List<Channel> getFollowingChannels(People people, Pageable pageable) {
        return followRepository.findByFollower(people, pageable).stream()
                .map(Follow::getChannel)
                .collect(Collectors.toList());
    }

    public long getFollowingCount(People people) {
        return followRepository.countByFollower(people);
    }
}
