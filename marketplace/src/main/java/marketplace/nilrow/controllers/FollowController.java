package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.follow.Follow;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.services.ChannelService;
import marketplace.nilrow.services.FollowService;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/follows")
@Tag(name = "Follows", description = "Operações relacionadas aos seguidores de canais")
public class FollowController {

    @Autowired
    private FollowService followService;

    @Autowired
    private ChannelService channelService;

    @Autowired
    private PeopleRepository peopleRepository;

    @PostMapping("/follow/{channelId}")
    public ResponseEntity<Void> followChannel(@PathVariable String channelId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People follower = peopleRepository.findByUser(user);
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        followService.followChannel(follower, channel);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/unfollow/{channelId}")
    public ResponseEntity<Void> unfollowChannel(@PathVariable String channelId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People follower = peopleRepository.findByUser(user);
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        followService.unfollowChannel(follower, channel);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/is-following/{channelId}")
    public ResponseEntity<Boolean> isFollowing(@PathVariable String channelId) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People follower = peopleRepository.findByUser(user);
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));

        boolean isFollowing = followService.isFollowing(follower, channel);
        return ResponseEntity.ok(isFollowing);
    }

    @GetMapping("/followers-count/{channelId}")
    public ResponseEntity<Long> getFollowersCount(@PathVariable String channelId) {
        Channel channel = channelService.getChannel(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        long followersCount = followService.getFollowersCount(channel);
        return ResponseEntity.ok(followersCount);
    }
}