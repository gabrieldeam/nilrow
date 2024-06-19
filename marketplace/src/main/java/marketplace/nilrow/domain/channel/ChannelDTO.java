package marketplace.nilrow.domain.channel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChannelDTO {
    private String id;
    private String name;
    private String biography;
    private String externalLink;
    private String imageUrl;
    private String nickname;

    public ChannelDTO(Channel channel) {
        this.id = channel.getId();
        this.name = channel.getName();
        this.biography = channel.getBiography();
        this.externalLink = channel.getExternalLink();
        this.imageUrl = channel.getImageUrl();
        this.nickname = channel.getPeople().getUser().getNickname();
    }
}
