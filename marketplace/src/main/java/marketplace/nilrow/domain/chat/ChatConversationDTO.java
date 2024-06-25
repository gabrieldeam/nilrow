package marketplace.nilrow.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import marketplace.nilrow.domain.channel.Channel;
import marketplace.nilrow.domain.people.People;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationDTO {
    private String id;
    private SimpleChannelDTO channel;
    private SimplePeopleDTO people;

    public ChatConversationDTO(ChatConversation conversation) {
        this.id = conversation.getId();
        this.channel = new SimpleChannelDTO(conversation.getChannel());
        this.people = new SimplePeopleDTO(conversation.getPeople());
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimpleChannelDTO {
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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimplePeopleDTO {
        private String id;
        private String name;
        private String nickname;

        public SimplePeopleDTO(People people) {
            this.id = people.getId();
            this.name = people.getName();
            this.nickname = people.getUser().getNickname();
        }
    }
}
