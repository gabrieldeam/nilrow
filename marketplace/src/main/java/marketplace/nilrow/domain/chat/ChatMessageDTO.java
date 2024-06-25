package marketplace.nilrow.domain.chat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private String id;
    private String content;
    private String sentAt;
    private boolean seen;
    private String senderType; // "PEOPLE" ou "CHANNEL"
    private String conversationId;

    public ChatMessageDTO(ChatMessage message, String senderType) {
        this.id = message.getId();
        this.content = message.getContent();
        this.sentAt = message.getSentAt().toString();
        this.seen = message.isSeen();
        this.senderType = senderType;
        this.conversationId = message.getConversation().getId();
    }
}
