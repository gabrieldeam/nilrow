package marketplace.nilrow.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import marketplace.nilrow.domain.channel.ChannelDTO;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.domain.people.PeopleFollowDTO;
import marketplace.nilrow.domain.user.User;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.services.ChannelService;
import marketplace.nilrow.services.FollowService;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/follows")
@Tag(name = "Follow", description = "Operações relacionadas aos seguidores de canais")
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

    @GetMapping("/followers/{nickname}")
    public ResponseEntity<List<PeopleFollowDTO>> getFollowers(@PathVariable String nickname, @RequestParam int page, @RequestParam int size) {
        Channel channel = channelService.getChannelByNickname(nickname).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        Pageable pageable = PageRequest.of(page, size);
        List<People> followers = followService.getFollowers(channel, pageable);
        List<PeopleFollowDTO> followerDTOs = followers.stream()
                .map(follower -> new PeopleFollowDTO(follower.getName(), follower.getUser().getNickname()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(followerDTOs);
    }

    @GetMapping("/following-channels/{nickname}")
    public ResponseEntity<List<ChannelDTO>> getFollowingChannels(@PathVariable String nickname, @RequestParam int page, @RequestParam int size) {
        People people = peopleRepository.findByUserNickname(nickname);
        if (people == null) {
            return ResponseEntity.notFound().build();
        }
        Pageable pageable = PageRequest.of(page, size);
        List<Channel> channels = followService.getFollowingChannels(people, pageable);
        List<ChannelDTO> channelDTOs = channels.stream().map(ChannelDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(channelDTOs);
    }

    @GetMapping("/following-count/{nickname}")
    public ResponseEntity<Long> getFollowingCount(@PathVariable String nickname) {
        People people = peopleRepository.findByUserNickname(nickname);
        if (people == null) {
            return ResponseEntity.notFound().build();
        }
        long followingCount = followService.getFollowingCount(people);
        return ResponseEntity.ok(followingCount);
    }

    @GetMapping("/my-following-channels")
    public ResponseEntity<List<ChannelDTO>> getMyFollowingChannels(@RequestParam int page, @RequestParam int size) {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = (User) userDetails;
        People people = peopleRepository.findByUser(user);
        Pageable pageable = PageRequest.of(page, size);
        List<Channel> channels = followService.getFollowingChannels(people, pageable);
        List<ChannelDTO> channelDTOs = channels.stream().map(ChannelDTO::new).collect(Collectors.toList());
        return ResponseEntity.ok(channelDTOs);
    }
}