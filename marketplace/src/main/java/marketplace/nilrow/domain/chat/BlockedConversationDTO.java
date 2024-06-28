package marketplace.nilrow.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlockedConversationDTO {
    private String conversationId;
    private String name;
    private String imageUrl;
    private String nickname;

    // Construtor para conversas com pessoas
    public BlockedConversationDTO(String conversationId, String name, String nickname) {
        this.conversationId = conversationId;
        this.name = name;
        this.nickname = nickname;
    }
}
