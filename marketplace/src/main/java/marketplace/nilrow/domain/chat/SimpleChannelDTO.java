package marketplace.nilrow.domain.channel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SimpleChannelDTO {
    private String id;
    private String name;
    private String imageUrl;
    private String nickname;

    public SimpleChannelDTO(Channel channel) {
        this.id = channel.getId();
        this.name = channel.getName();
        this.imageUrl = channel.getImageUrl();
        this.nickname = channel.getPeople().getUser().getNickname();
    }
}
