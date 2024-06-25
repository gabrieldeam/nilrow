package marketplace.nilrow.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import marketplace.nilrow.domain.channel.Channel;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationChannelDTO {
    private String conversationId;
    private String channelId;
    private String name;
    private String imageUrl;
    private String nickname;

    public ConversationChannelDTO(ChatConversation conversation) {
        this.conversationId = conversation.getId();
        Channel channel = conversation.getChannel();
        this.channelId = channel.getId();
        this.name = channel.getName();
        this.imageUrl = channel.getImageUrl();
        this.nickname = channel.getPeople().getUser().getNickname();
    }
}
