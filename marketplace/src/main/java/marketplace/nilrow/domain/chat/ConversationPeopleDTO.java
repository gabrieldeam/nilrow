package marketplace.nilrow.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import marketplace.nilrow.domain.people.People;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationPeopleDTO {
    private String conversationId;
    private String peopleId;
    private String name;
    private String nickname;

    public ConversationPeopleDTO(ChatConversation conversation) {
        this.conversationId = conversation.getId();
        People people = conversation.getPeople();
        this.peopleId = people.getId();
        this.name = people.getName();
        this.nickname = people.getUser().getNickname();
    }
}
