package marketplace.nilrow.services;

import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;
import marketplace.nilrow.repositories.ChannelRepository;
import marketplace.nilrow.repositories.PeopleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ChannelService {

    @Autowired
    private ChannelRepository channelRepository;

    @Autowired
    private PeopleRepository peopleRepository;

    public Optional<Channel> createChannel(String peopleId, Channel channelData) {
        People people = peopleRepository.findById(peopleId).orElseThrow(() -> new IllegalArgumentException("People not found"));
        if (channelRepository.findByPeople(people).isPresent()) {
            throw new IllegalArgumentException("Channel already exists for this user");
        }
        channelData.setPeople(people);
        return Optional.of(channelRepository.save(channelData));
    }

    public Optional<Channel> updateChannel(String channelId, Channel channelData) {
        Channel existingChannel = channelRepository.findById(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        existingChannel.setName(channelData.getName());
        existingChannel.setBiography(channelData.getBiography());
        existingChannel.setExternalLink(channelData.getExternalLink());
        existingChannel.setImageUrl(channelData.getImageUrl());
        return Optional.of(channelRepository.save(existingChannel));
    }

    public Optional<Channel> getChannel(String channelId) {
        return channelRepository.findById(channelId);
    }

    public Optional<Channel> getChannelByPeople(People people) {
        return channelRepository.findByPeople(people);
    }

    public Optional<Channel> getChannelByNickname(String nickname) {
        return channelRepository.findByPeopleUserNickname(nickname);
    }

    @Transactional
    public void toggleChannelVisibility(String channelId, boolean active) {
        Channel channel = channelRepository.findById(channelId).orElseThrow(() -> new IllegalArgumentException("Channel not found"));
        channel.setActive(active);
        channelRepository.save(channel);
    }

    public Optional<Channel> getChannelByPeopleUsername(String username) {
        return channelRepository.findByPeopleUserNickname(username);
    }
}
