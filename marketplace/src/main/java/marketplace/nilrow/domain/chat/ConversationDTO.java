package marketplace.nilrow.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private String id;
    private String name;
    private String imageUrl;
    private String nickname;

    public ConversationDTO(String id, String name, String nickname) {
        this.id = id;
        this.name = name;
        this.nickname = nickname;
    }
}
